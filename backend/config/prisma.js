const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.warn('SUPABASE_URL or SUPABASE_KEY not set. Database operations will fail.')
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '')

const TABLE_MAP = {
    user: 'User',
    course: 'Course',
    courseEnrollment: 'CourseEnrollment',
    unit: 'Unit',
    lesson: 'Lesson',
    assignment: 'Assignment',
    submission: 'Submission',
    grade: 'Grade',
    assessment: 'Assessment',
    assessmentAttempt: 'AssessmentAttempt',
    courseAccessCode: 'CourseAccessCode',
    courseDiscountCode: 'CourseDiscountCode',
    joinTeacherApplication: 'JoinTeacherApplication',
    motivationalMessage: 'MotivationalMessage',
    studentLessonProgress: 'StudentLessonProgress',
    studentVideoProgress: 'StudentVideoProgress',
    studentMessageDismissal: 'StudentMessageDismissal',
    walletTransaction: 'WalletTransaction'
}

function resolveTableName(key) {
    return TABLE_MAP[key] || key
}

function isOperatorObject(val) {
    if (!val || typeof val !== 'object' || Array.isArray(val)) return false
    const opKeys = ['contains', 'startsWith', 'endsWith', 'not', 'in', 'gte', 'lte', 'gt', 'lt', 'equals', 'mode', 'increment', 'decrement', 'set']
    return Object.keys(val).every((k) => opKeys.includes(k))
}

function buildEmbed(key, val) {
    const targetTable = resolveTableName(key)
    if (val === true) return `${key}:${targetTable}(*)`
    if (val && typeof val === 'object') {
        const nested = []
        if (val.select) {
            for (const [sk, sv] of Object.entries(val.select)) {
                if (sv === true) nested.push(sk)
                else if (sv && typeof sv === 'object' && !isOperatorObject(sv)) {
                    const sub = buildEmbed(sk, sv)
                    if (sub) nested.push(sub)
                }
            }
        }
        if (val.include) {
            for (const [ik, iv] of Object.entries(val.include)) {
                const sub = buildEmbed(ik, iv)
                if (sub) nested.push(sub)
            }
        }
        return `${key}:${targetTable}(${nested.join(',')})`
    }
    return null
}

function buildSelect(selectObj, includeObj) {
    if (!selectObj && !includeObj) return '*'
    const cols = []
    if (selectObj) {
        for (const [k, v] of Object.entries(selectObj)) {
            if (v === true) {
                cols.push(k)
            } else if (v && typeof v === 'object' && !isOperatorObject(v)) {
                const embed = buildEmbed(k, v)
                if (embed) cols.push(embed)
            }
        }
    }
    if (includeObj) {
        for (const [k, v] of Object.entries(includeObj)) {
            const embed = buildEmbed(k, v)
            if (embed) cols.push(embed)
        }
    }
    return cols.length ? cols.join(',') : '*'
}

function applyFilters(query, where, depth) {
    if (!where || typeof where !== 'object') return query
    let q = query

    for (const [key, val] of Object.entries(where)) {
        if (key === 'AND' && Array.isArray(val)) {
            for (const cond of val) {
                q = applyFilters(q, cond, (depth || 0) + 1)
            }
            continue
        }
        if (key === 'OR' && Array.isArray(val)) {
            const orParts = []
            for (const cond of val) {
                for (const [k, v] of Object.entries(cond)) {
                    if (v && typeof v === 'object' && 'contains' in v && typeof v.contains === 'string') {
                        orParts.push(`${k}.ilike.%${v.contains}%`)
                    } else if (typeof v === 'string') {
                        orParts.push(`${k}.ilike.%${v}%`)
                    } else if (v !== null && typeof v === 'object' && 'in' in v) {
                        orParts.push(`${k}.in.(${v.in.join(',')})`)
                    }
                }
            }
            if (orParts.length) q = q.or(orParts.join(','))
            continue
        }
        if (val === null || (val && typeof val === 'object' && val.equals === null)) {
            q = q.is(key, null)
        } else if (val && typeof val === 'object') {
            if (key.includes('_') && !isOperatorObject(val)) {
                for (const [sk, sv] of Object.entries(val)) {
                    if (sv === null) q = q.is(sk, null)
                    else if (sv && typeof sv === 'object' && sv.equals !== undefined) q = q.eq(sk, sv.equals)
                    else q = q.eq(sk, sv)
                }
            } else if ('contains' in val && typeof val.contains === 'string') {
                q = q.ilike(key, `%${val.contains}%`)
            } else if ('contains' in val && typeof val.contains === 'object') {
                q = q.contains(key, val.contains)
            } else if ('startsWith' in val) {
                q = q.ilike(key, `${val.startsWith}%`)
            } else if ('endsWith' in val) {
                q = q.ilike(key, `%${val.endsWith}`)
            } else if ('not' in val) {
                if (val.not === null) q = q.not(key, 'is', null)
                else if (typeof val.not === 'object' && 'in' in val.not) q = q.not(key, 'in', val.not.in)
                else q = q.neq(key, val.not)
            } else if ('in' in val) {
                q = q.in(key, val.in)
            } else if ('gte' in val) {
                q = q.gte(key, val.gte)
            } else if ('lte' in val) {
                q = q.lte(key, val.lte)
            } else if ('gt' in val) {
                q = q.gt(key, val.gt)
            } else if ('lt' in val) {
                q = q.lt(key, val.lt)
            } else if ('equals' in val) {
                if (val.equals === null) q = q.is(key, null)
                else q = q.eq(key, val.equals)
            } else if ('mode' in val && 'contains' in val) {
                q = q.ilike(key, `%${val.contains}%`)
            } else if (typeof val === 'object' && !isOperatorObject(val)) {
                let relationApplied = false
                for (const [subKey, subVal] of Object.entries(val)) {
                    if (subVal && typeof subVal === 'object' && 'some' in subVal) {
                        for (const [sk2, sv2] of Object.entries(subVal.some)) {
                            if (sv2 && typeof sv2 === 'object' && 'in' in sv2) {
                                q = q.filter(`${key}.${subKey}.${sk2}`, 'in', `(${sv2.in.join(',')})`)
                            } else if (sv2 && typeof sv2 === 'object' && 'contains' in sv2 && typeof sv2.contains === 'string') {
                                q = q.filter(`${key}.${subKey}.${sk2}`, 'ilike', `%${sv2.contains}%`)
                            } else if (sv2 === true) {
                                q = q.not(`${key}.${subKey}.${sk2}`, 'is', null)
                            } else if (sv2 !== null && typeof sv2 === 'object' && sv2.equals !== undefined) {
                                q = q.eq(`${key}.${subKey}.${sk2}`, sv2.equals)
                            } else if (sv2 === null) {
                                q = q.is(`${key}.${subKey}.${sk2}`, null)
                            } else {
                                q = q.eq(`${key}.${subKey}.${sk2}`, sv2)
                            }
                        }
                        relationApplied = true
                        continue
                    }
                    if (subVal && typeof subVal === 'object' && 'in' in subVal) {
                        q = q.filter(`${key}.${subKey}`, 'in', `(${subVal.in.join(',')})`)
                    } else if (subVal && typeof subVal === 'object' && 'contains' in subVal && typeof subVal.contains === 'string') {
                        q = q.filter(`${key}.${subKey}`, 'ilike', `%${subVal.contains}%`)
                    } else if (subVal && typeof subVal === 'object' && subVal.equals !== undefined) {
                        q = q.eq(`${key}.${subKey}`, subVal.equals)
                    } else if (subVal === true) {
                        q = q.not(`${key}.${subKey}`, 'is', null)
                    } else if (subVal === null) {
                        q = q.is(`${key}.${subKey}`, null)
                    } else {
                        q = q.eq(`${key}.${subKey}`, subVal)
                    }
                    relationApplied = true
                }
                if (!relationApplied) q = q.eq(key, val)
            }
        } else {
            q = q.eq(key, val)
        }
    }
    return q
}

function applyOrderBy(query, orderBy) {
    if (!orderBy) return query
    if (Array.isArray(orderBy)) {
        for (const o of orderBy) {
            if (typeof o === 'string') {
                query = query.order(o, { ascending: true, nullsFirst: false })
            } else if (typeof o === 'object') {
                for (const [col, opts] of Object.entries(o)) {
                    const ascending = typeof opts === 'string' ? opts === 'asc' : (opts && opts.sort === 'asc')
                    query = query.order(col, { ascending, nullsFirst: false })
                }
            }
        }
    } else if (typeof orderBy === 'string') {
        query = query.order(orderBy, { ascending: true, nullsFirst: false })
    } else if (typeof orderBy === 'object') {
        for (const [col, opts] of Object.entries(orderBy)) {
            const ascending = typeof opts === 'string' ? opts === 'asc' : (opts && opts.sort === 'asc')
            query = query.order(col, { ascending, nullsFirst: false })
        }
    }
    return query
}

function hasArithmeticOps(data) {
    if (!data || typeof data !== 'object') return false
    return Object.values(data).some((v) => v && typeof v === 'object' && !Array.isArray(v) && ('increment' in v || 'decrement' in v))
}

function resolveArithmeticOps(data, rows) {
    const patch = {}
    for (const [k, v] of Object.entries(data)) {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            const current = rows && rows.length ? Number(rows[0][k]) || 0 : 0
            if ('increment' in v) {
                patch[k] = current + Number(v.increment)
                continue
            }
            if ('decrement' in v) {
                patch[k] = Math.max(0, current - Number(v.decrement))
                continue
            }
            if ('set' in v) {
                patch[k] = v.set
                continue
            }
        }
        patch[k] = v
    }
    return patch
}

async function runSelectWithFallback(tableName, build, args) {
    try {
        const q = build()
        const { data, error } = await q
        if (error) throw error
        return data
    } catch (err) {
        const isEmbedError = err && /relationship|foreign|embed|hint|ambiguous|could not find/i.test(String(err.message || ''))
        if (!isEmbedError) throw err
        const flatArgs = { ...args, select: undefined, include: undefined }
        const q = supabase.from(tableName).select(buildSelect(flatArgs.select, undefined))
        let fq = applyFilters(q, flatArgs.where)
        fq = applyOrderBy(fq, flatArgs.orderBy)
        if (flatArgs.take) fq = fq.limit(flatArgs.take)
        if (flatArgs.skip) fq = fq.range(flatArgs.skip, flatArgs.skip + (flatArgs.take || 50) - 1)
        const { data, error } = await fq
        if (error) throw error
        return data || []
    }
}

class TableProxy {
    constructor(tableName) {
        this.tableName = tableName
    }

    async findFirst(args = {}) {
        let q = supabase.from(this.tableName).select(buildSelect(args.select, args.include))
        q = applyFilters(q, args.where)
        if (args.orderBy) q = applyOrderBy(q, args.orderBy)
        q = q.limit(1).maybeSingle()
        try {
            const { data, error } = await q
            if (error) throw error
            return data
        } catch (err) {
            const isEmbedError = err && /relationship|foreign|embed|hint|ambiguous|could not find/i.test(String(err.message || ''))
            if (!isEmbedError) throw err
            const flatQ = supabase.from(this.tableName).select(buildSelect(args.select))
            let fq = applyFilters(flatQ, args.where)
            if (args.orderBy) fq = applyOrderBy(fq, args.orderBy)
            fq = fq.limit(1).maybeSingle()
            const { data, error } = await fq
            if (error) throw error
            return data
        }
    }

    async findUnique(args = {}) {
        const where = args.where || {}
        if (where.id) {
            try {
                const { data, error } = await supabase.from(this.tableName)
                    .select(buildSelect(args.select, args.include))
                    .eq('id', where.id)
                    .maybeSingle()
                if (error) throw error
                return data
            } catch (err) {
                const isEmbedError = err && /relationship|foreign|embed|hint|ambiguous|could not find/i.test(String(err.message || ''))
                if (!isEmbedError) throw err
                const { data, error } = await supabase.from(this.tableName)
                    .select(buildSelect(args.select))
                    .eq('id', where.id)
                    .maybeSingle()
                if (error) throw error
                return data
            }
        }
        if (where.email) {
            const { data, error } = await supabase.from(this.tableName)
                .select(buildSelect(args.select, args.include))
                .eq('email', where.email)
                .maybeSingle()
            if (error) throw error
            return data
        }
        if (where.code) {
            const { data, error } = await supabase.from(this.tableName)
                .select(buildSelect(args.select, args.include))
                .eq('code', where.code)
                .maybeSingle()
            if (error) throw error
            return data
        }
        return this.findFirst(args)
    }

    async findMany(args = {}) {
        const data = await runSelectWithFallback(this.tableName, () => {
            let q = supabase.from(this.tableName).select(buildSelect(args.select, args.include))
            q = applyFilters(q, args.where)
            q = applyOrderBy(q, args.orderBy)
            if (args.take) q = q.limit(args.take)
            if (args.skip) q = q.range(args.skip, args.skip + (args.take || 50) - 1)
            return q
        }, args)
        return data || []
    }

    async create(args = {}) {
        const row = { ...args.data }
        if (!row.id) {
            const { randomUUID } = require('crypto')
            row.id = randomUUID()
        }
        const now = new Date().toISOString()
        if (!row.createdAt) row.createdAt = now
        if (!row.updatedAt) row.updatedAt = now
        const { error } = await supabase.from(this.tableName)
            .insert(row)
        if (error) throw error
        return row
    }

    async createMany(args = {}) {
        const rows = args.data || []
        if (!rows.length) return { count: 0 }
        const { data, error } = await supabase.from(this.tableName).insert(rows).select()
        if (error) throw error
        return { count: (data || []).length }
    }

    async update(args = {}) {
        const where = args.where || {}
        let data = args.data || {}
        let q = supabase.from(this.tableName).update(data)
        if (where.id) q = q.eq('id', where.id)
        else {
            for (const [k, v] of Object.entries(where)) {
                if (v !== null && typeof v === 'object' && 'equals' in v) q = q.eq(k, v.equals)
                else if (v === null) q = q.is(k, null)
                else if (typeof v === 'object' && k.includes('_')) {
                    for (const [sk, sv] of Object.entries(v)) q = q.eq(sk, sv)
                } else q = q.eq(k, v)
            }
        }
        if (hasArithmeticOps(data)) {
            const sel = Object.keys(data).join(',')
            let cur = supabase.from(this.tableName).select(sel)
            if (where.id) cur = cur.eq('id', where.id)
            else {
                for (const [k, v] of Object.entries(where)) {
                    cur = cur.eq(k, typeof v === 'object' && 'equals' in v ? v.equals : v)
                }
            }
            const { data: rows, error: curErr } = await cur.limit(1)
            if (curErr) throw curErr
            data = resolveArithmeticOps(data, rows)
            q = supabase.from(this.tableName).update(data)
            if (where.id) q = q.eq('id', where.id)
            else {
                for (const [k, v] of Object.entries(where)) {
                    if (v !== null && typeof v === 'object' && 'equals' in v) q = q.eq(k, v.equals)
                    else if (v === null) q = q.is(k, null)
                    else if (typeof v === 'object' && k.includes('_')) {
                        for (const [sk, sv] of Object.entries(v)) q = q.eq(sk, sv)
                    } else q = q.eq(k, v)
                }
            }
        }
        const { data: updated, error } = await q.select().maybeSingle()
        if (error) throw error
        return updated
    }

    async updateMany(args = {}) {
        const where = args.where || {}
        let data = args.data || {}
        if (hasArithmeticOps(data)) {
            const sel = Object.keys(data).join(',')
            let cur = supabase.from(this.tableName).select(sel)
            cur = applyFilters(cur, where)
            const { data: rows, error: curErr } = await cur.limit(1)
            if (curErr) throw curErr
            data = resolveArithmeticOps(data, rows)
        }
        let q = supabase.from(this.tableName).update(data)
        q = applyFilters(q, where)
        const { data: updated, error } = await q.select()
        if (error) throw error
        return { count: (updated || []).length }
    }

    async delete(args = {}) {
        const where = args.where || {}
        let q = supabase.from(this.tableName).delete()
        if (where.id) q = q.eq('id', where.id)
        else {
            for (const [k, v] of Object.entries(where)) {
                q = q.eq(k, v)
            }
        }
        const { error } = await q
        if (error) throw error
    }

    async deleteMany(args = {}) {
        const where = args.where || {}
        let q = supabase.from(this.tableName).delete()
        q = applyFilters(q, where)
        const { error } = await q
        if (error) throw error
        return { count: 0 }
    }

    async count(args = {}) {
        let q = supabase.from(this.tableName).select('*', { count: 'exact', head: true })
        q = applyFilters(q, args.where)
        const { count, error } = await q
        if (error) throw error
        return count || 0
    }

    async groupBy(args = {}) {
        const { by, _count, where } = args
        if (by && by.length === 1) {
            const col = by[0]
            let q = supabase.from(this.tableName).select(col)
            q = applyFilters(q, where)
            const { data, error } = await q
            if (error) throw error
            const map = {}
            for (const row of (data || [])) {
                const val = row[col] || 'null'
                if (!map[val]) map[val] = { [col]: val, _count: { [col]: 0 } }
                map[val]._count[col]++
            }
            return Object.values(map)
        }
        return []
    }

    async aggregate(args = {}) {
        const where = args.where || {}
        const _sum = args._sum || {}
        const cols = Object.keys(_sum)
        if (!cols.length) return { _sum: {} }
        let q = supabase.from(this.tableName).select(cols.join(','))
        q = applyFilters(q, where)
        const { data, error } = await q
        if (error) throw error
        const result = {}
        for (const col of cols) {
            result[col] = (data || []).reduce((s, r) => s + (Number(r[col]) || 0), 0)
        }
        return { _sum: result }
    }

    async upsert(args = {}) {
        const { where = {}, create = {}, update = {} } = args
        const existing = await this.findFirst({ where })
        if (existing) {
            const updated = await this.update({ where: { id: existing.id }, data: update })
            return updated || existing
        }
        return this.create({ data: create })
    }
}

const prisma = {}
for (const [camelName, tableName] of Object.entries(TABLE_MAP)) {
    prisma[camelName] = new TableProxy(tableName)
}

prisma.$queryRawUnsafe = async (rawQuery, ...args) => {
    let sql = rawQuery
    for (let i = 0; i < args.length; i++) {
        sql = sql.replace(new RegExp(`\\$${i + 1}`, 'g'), `'${String(args[i]).replace(/'/g, "''")}'`)
    }
    const { data, error } = await supabase.rpc('run_sql', { query_text: sql })
    if (error) throw error
    return data || []
}

prisma.$transaction = async (fns) => {
    const results = []
    for (const fn of fns) {
        results.push(await fn)
    }
    return results
}

module.exports = { prisma }
