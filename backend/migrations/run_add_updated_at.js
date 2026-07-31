const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const { Client } = require(path.join(__dirname, '..', 'node_modules', 'pg'))
const dns = require('dns')

function ipv6Lookup(host, opts, cb) {
    dns.resolve6(host, (err, addrs) => {
        if (err || !addrs || !addrs.length) return cb(err || new Error('no AAAA records'))
        cb(null, addrs[0], 6)
    })
}

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        lookup: ipv6Lookup
    })
    await client.connect()
    console.log('connected over IPv6')

    const statements = [
        'ALTER TABLE "CourseEnrollment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP',
        'ALTER TABLE "StudentMessageDismissal" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP',
        'ALTER TABLE "WalletTransaction" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP'
    ]
    for (const sql of statements) {
        try {
            await client.query(sql)
            console.log('OK:', sql)
        } catch (e) {
            console.log('FAIL:', sql, '->', e.message)
        }
    }

    const res = await client.query(
        "SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('CourseEnrollment','StudentMessageDismissal','WalletTransaction') AND column_name = 'updatedAt' ORDER BY table_name"
    )
    console.log('verified:', JSON.stringify(res.rows))

    const stale = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('CourseEnrollment','StudentMessageDismissal')"
    )
    console.log('tables exist:', JSON.stringify(stale.rows))

    await client.end()
}

main().catch((e) => {
    console.error('FATAL', e.message)
    process.exit(1)
})
