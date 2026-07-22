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

function buildSelect(selectObj, includeObj) {
    if (!selectObj && !includeObj) return '*'
    const cols = []
    if (selectObj) {
        for (const [k, v] of Object.entries(selectObj)) {
            if (v === true) {
                cols.push(k)
            } else if (v && typeof v === 'object' && v.select) {
                const nested = Object.entries(v.select).filter(([, sv]) => sv === true).map(([sk]) => sk)
                const targetTable = TABLE_MAP[k] || k
                if (nested.length) {
                    cols.push(`${k}:${targetTable}(${nested.join(',')})`)
                } else {
                    cols.push(`${k}:${targetTable}(*)`)
                }
            }
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
            if ('contains' in val && typeof val.contains === 'string') {
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

class TableProxy {
    constructor(tableName) {
        this.tableName = tableName
    }

    async findFirst(args = {}) {
        let q = supabase.from(this.tableName).select(buildSelect(args.select, args.include))
        q = applyFilters(q, args.where)
        if (args.orderBy) q = applyOrderBy(q, args.orderBy)
        q = q.limit(1).maybeSingle()
        const { data, error } = await q
        if (error) throw error
        return data
    }

    async findUnique(args = {}) {
        const where = args.where || {}
        if (where.id) {
            const { data, error } = await supabase.from(this.tableName)
                .select(buildSelect(args.select, args.include))
                .eq('id', where.id)
                .single()
            if (error) throw error
            return data
        }
        if (where.email) {
            const { data, error } = await supabase.from(this.tableName)
                .select(buildSelect(args.select, args.include))
                .eq('email', where.email)
                .single()
            if (error) throw error
            return data
        }
        if (where.code) {
            const { data, error } = await supabase.from(this.tableName)
                .select(buildSelect(args.select, args.include))
                .eq('code', where.code)
                .single()
            if (error) throw error
            return data
        }
        return this.findFirst(args)
    }

    async findMany(args = {}) {
        let q = supabase.from(this.tableName).select(buildSelect(args.select, args.include))
        q = applyFilters(q, args.where)
        q = applyOrderBy(q, args.orderBy)
        if (args.take) q = q.limit(args.take)
        if (args.skip) q = q.range(args.skip, args.skip + (args.take || 50) - 1)
        const { data, error } = await q
        if (error) throw error
        return data || []
    }

    async create(args = {}) {
        const row = args.data || {}
        const { data, error } = await supabase.from(this.tableName)
            .insert(row)
            .select()
            .single()
        if (error) throw error
        return data
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
        const data = args.data || {}
        let q = supabase.from(this.tableName).update(data)
        if (where.id) q = q.eq('id', where.id)
        else {
            for (const [k, v] of Object.entries(where)) {
                if (v !== null && typeof v === 'object' && 'equals' in v) q = q.eq(k, v.equals)
                else q = q.eq(k, v)
            }
        }
        const { data: updated, error } = await q.select().single()
        if (error) throw error
        return updated
    }

    async updateMany(args = {}) {
        const where = args.where || {}
        const data = args.data || {}
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
        const { by, _count } = args
        if (by && by.length === 1) {
            const col = by[0]
            const { data, error } = await supabase.from(this.tableName).select(col)
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
        const row = args.data || {}
        const { data, error } = await supabase.from(this.tableName)
            .upsert(row)
            .select()
            .single()
        if (error) throw error
        return data
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
