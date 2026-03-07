const express = require('express');
const app = express();

const { uploadRoutes } = require('../routes/uploadRoutes')
const { userRoutes } = require('../routes/userRoutes')
const { studentRoutes } = require('../routes/studentRoutes')
const { teacherRoutes } = require('../routes/teacherRoutes')
const { subjectRoutes } = require('../routes/subjectRoutes')
const { errorHandler } = require('../middleware/errorHandler')

app.use('/api/uploads', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);

app.use(errorHandler);

module.exports = app;