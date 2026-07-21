const { prisma } = require('../config/prisma')

function courseIsFree(course) {
    if (!course) return false
    if (typeof course.isFree === 'boolean') return course.isFree
    const p = Number(course.price || 0)
    return Number.isFinite(p) && p <= 0
}

async function attachCourse(req, res, next) {
    try {
        const courseId = req.params.courseId || req.body?.courseId || req.query?.courseId
        if (!courseId) return res.status(400).json({ message: 'courseId is required' })

        const course = await prisma.course.findUnique({ where: { id: courseId } })
        if (!course) return res.status(404).json({ message: 'Course not found' })

        req.course = course
        return next()
    } catch (e) {
        return next(e)
    }
}

async function canAccessCourse(req, res, next) {
    const course = req.course
    const user = req.user

    if (!user) return res.status(401).json({ message: 'Login required' })

    if (user.role === 'admin') return next()

    const isFree = courseIsFree(course)
    if (isFree && user.role === 'student') return next()

    if (user.role === 'teacher') {
        if (String(course.teacherId) === String(user.id)) return next()
        return res.status(403).json({ message: 'Forbidden' })
    }

    if (user.role === 'team') {
        return next()
    }

    if (user.role === 'student') {
        const enrollment = await prisma.courseEnrollment.findFirst({
            where: { courseId: course.id, studentId: user.id }
        })
        if (enrollment) return next()
        return res.status(403).json({ message: 'Course locked' })
    }

    return res.status(403).json({ message: 'Forbidden' })
}

module.exports = { attachCourse, canAccessCourse }
