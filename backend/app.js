const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const { authRoutes } = require('./routes/authRoutes')
const { adminRoutes } = require('./routes/adminRoutes')
const { courseRoutes } = require('./routes/courseRoutes')
const { assignmentRoutes } = require('./routes/assignmentRoutes')
const { approvalRoutes } = require('./routes/approvalRoutes')
const { assessmentRoutes } = require('./routes/assessmentRoutes')
const { uploadRoutes } = require('./routes/uploadRoutes')
const { userRoutes } = require('./routes/userRoutes')
const { studentRoutes } = require('./routes/studentRoutes')
const { teacherRoutes } = require('./routes/teacherRoutes')
const { subjectRoutes } = require('./routes/subjectRoutes')
const { joinTeacherApplicationRoutes } = require('./routes/joinTeacherApplicationRoutes')
const { accessCodeRoutes } = require('./routes/accessCodeRoutes')
const { discountCodeRoutes } = require('./routes/discountCodeRoutes')
const { motivationalMessageRoutes } = require('./routes/motivationalMessageRoutes')
const { walletRoutes } = require('./routes/walletRoutes')
const { progressRoutes } = require('./routes/progressRoutes')
const { notificationRoutes } = require('./routes/notificationRoutes')
const { errorHandler } = require('./middleware/errorHandler')

function createApp() {
    const app = express()

    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: 'cross-origin' }
        })
    )
    app.use(cors({ origin: true, credentials: true }))
    app.use(express.json({ limit: '1mb' }))
    app.use(morgan('dev'))

    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000,
            limit: 5000 // Increased from 300 to avoid 429 errors during dev/testing
        })
    )

    app.get('/', (req, res) => {
        res.status(200).json({
            name: 'Education Platform API',
            ok: true,
            health: '/health',
            docs: null
        })
    })

    app.get('/health', (req, res) => res.json({ ok: true }))

    app.use('/api/auth', authRoutes)
    app.use('/api/admin', adminRoutes)
    app.use('/api/courses', courseRoutes)
    app.use('/api/assignments', assignmentRoutes)
    app.use('/api/approvals', approvalRoutes)
    app.use('/api/assessments', assessmentRoutes)
    app.use('/api/uploads', uploadRoutes)
    app.use('/api/users', userRoutes)
    app.use('/api/students', studentRoutes)
    app.use('/api/teachers', teacherRoutes)
    app.use('/api/subjects', subjectRoutes)
    app.use('/api/join-teachers', joinTeacherApplicationRoutes)
    app.use('/api/access-codes', accessCodeRoutes)
    app.use('/api/discount-codes', discountCodeRoutes)
    app.use('/api/motivational-message', motivationalMessageRoutes)
    app.use('/api/wallet', walletRoutes)
    app.use('/api/progress', progressRoutes)
    app.use('/api/notifications', notificationRoutes)

    app.use(errorHandler)

    return app
}

module.exports = { createApp }