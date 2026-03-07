const mongoose = require('mongoose')
const { Course } = require('../models/Course')
const { Unit } = require('../models/Unit')
const { Lesson } = require('../models/Lesson')
const { User } = require('../models/User')
const { asyncHandler } = require('../utils/asyncHandler')

const createCourse = asyncHandler(async(req, res) => {
    const { title, description } = req.body || {}
    if (!title) return res.status(400).json({ message: 'title is required' })

    const course = await Course.create({
        title,
        description: description || '',
        teacher: req.user.id,
        students: []
    })

    res.status(201).json(course)
})

const myCourses = asyncHandler(async(req, res) => {
    if (req.user.role === 'teacher') {
        const courses = await Course.find({ teacher: req.user.id })
        return res.json(courses)
    }
    if (req.user.role === 'student') {
        const courses = await Course.find({ students: req.user.id })
        return res.json(courses)
    }
    return res.status(403).json({ message: 'Forbidden' })
})

const addUnit = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const { title, description, order } = req.body || {}
    if (!title) return res.status(400).json({ message: 'title is required' })

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const unit = await Unit.create({
        course: course._id,
        title,
        description: typeof description === 'string' ? description : '',
        order: order || 0
    })
    res.status(201).json(unit)
})

const addLesson = asyncHandler(async(req, res) => {
    const { unitId } = req.params
    const { title, videoUrl, pdfUrl, order } = req.body || {}
    if (!title) return res.status(400).json({ message: 'title is required' })

    const unit = await Unit.findById(unitId)
    if (!unit) return res.status(404).json({ message: 'Unit not found' })

    const course = await Course.findById(unit.course)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const lesson = await Lesson.create({
        unit: unit._id,
        title,
        videoUrl: videoUrl || '',
        pdfUrl: pdfUrl || '',
        order: order || 0
    })
    res.status(201).json(lesson)
})

const enrollStudent = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const { studentId } = req.body || {}
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: 'Valid studentId is required' })
    }

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const student = await User.findById(studentId)
    if (!student || student.role !== 'student') return res.status(400).json({ message: 'Invalid student' })

    const already = course.students.some((s) => s.toString() === studentId)
    if (!already) course.students.push(student._id)
    await course.save()

    res.json({ message: 'Enrolled', courseId: course._id.toString(), studentId })
})

module.exports = { createCourse, myCourses, addUnit, addLesson, enrollStudent }