const { Enrollment, Student, Course, User } = require('../models');
const { BadRequestError, NotFoundError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const resolveStudentId = async (studentIdentifier) => {
  if (!studentIdentifier) return null;
  const isValidObjectId = studentIdentifier.match(/^[0-9a-fA-F]{24}$/);
  if (isValidObjectId) {
    return studentIdentifier;
  } else {
    const student = await Student.findOne({ 
      $or: [
        { rollNumber: studentIdentifier },
        { 'userId.email': studentIdentifier }
      ]
    }).populate('userId').lean();
    return student?._id;
  }
};

const resolveCourseId = async (courseIdentifier) => {
  if (!courseIdentifier) return null;
  const isValidObjectId = courseIdentifier.match(/^[0-9a-fA-F]{24}$/);
  if (isValidObjectId) {
    return courseIdentifier;
  } else {
    const course = await Course.findOne({ 
      $or: [
        { code: courseIdentifier },
        { name: { $regex: courseIdentifier, $options: 'i' } }
      ]
    }).lean();
    return course?._id;
  }
};

const createEnrollment = async (req, res) => {
  try {
    const {
      studentId,
      courseId,
      enrollmentDate,
      status,
      progress,
      grade,
      marksObtained,
      remarks
    } = req.body;

    if (!studentId || !courseId) {
      throw new BadRequestError('Student ID and Course ID are required');
    }

    const student = await Student.findById(studentId).populate({
      path: 'userId',
      select: 'firstName lastName email'
    }).lean();
    
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: { $in: ['enrolled', 'completed'] }
    }).lean();

    if (existingEnrollment) {
      throw new BadRequestError('Student already enrolled in this course');
    }

    const enrolledCount = await Enrollment.countDocuments({
      courseId,
      status: 'enrolled'
    });

    if (enrolledCount >= course.maxStudents) {
      throw new BadRequestError('Course has reached maximum capacity');
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      enrollmentDate: enrollmentDate || Date.now(),
      status: status || 'enrolled',
      progress: progress || 0,
      grade: grade || 'Not Graded',
      marksObtained,
      remarks
    });

    await enrollment.populate([
      { 
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      },
      { path: 'courseId', select: 'name code credits department' }
    ]);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Student enrolled successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    throw error;
  }
};

const getAllEnrollments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      studentId,
      courseId,
      status,
      search
    } = req.query;

    const query = {};
    
    if (status) query.status = status;

    if (studentId) {
      const resolvedStudentId = await resolveStudentId(studentId);
      if (resolvedStudentId) {
        query.studentId = resolvedStudentId;
      } else {
        return res.status(StatusCodes.OK).json({
          success: true,
          count: 0,
          total: 0,
          page: parseInt(page),
          pages: 0,
          data: []
        });
      }
    }

    if (courseId) {
      const resolvedCourseId = await resolveCourseId(courseId);
      if (resolvedCourseId) {
        query.courseId = resolvedCourseId;
      } else {
        return res.status(StatusCodes.OK).json({
          success: true,
          count: 0,
          total: 0,
          page: parseInt(page),
          pages: 0,
          data: []
        });
      }
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      
      const users = await User.find({
        role: 'student',
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      }).select('_id').lean();
      
      const userIds = users.map(u => u._id);

      const students = await Student.find({
        $or: [
          { userId: { $in: userIds } },
          { rollNumber: { $regex: searchTerm, $options: 'i' } },
          { class: { $regex: searchTerm, $options: 'i' } }
        ]
      }).select('_id').lean();
      
      const studentIds = students.map(s => s._id);

      const courses = await Course.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { code: { $regex: searchTerm, $options: 'i' } },
          { department: { $regex: searchTerm, $options: 'i' } }
        ]
      }).select('_id').lean();
      
      const courseIds = courses.map(c => c._id);

      query.$or = [];

      if (studentIds.length > 0) {
        query.$or.push({ studentId: { $in: studentIds } });
      }

      if (courseIds.length > 0) {
        query.$or.push({ courseId: { $in: courseIds } });
      }

      if (studentIds.length === 0 && courseIds.length === 0) {
        return res.status(StatusCodes.OK).json({
          success: true,
          count: 0,
          total: 0,
          page: parseInt(page),
          pages: 0,
          data: []
        });
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    const enrollments = await Enrollment.find(query)
      .populate([
        { 
          path: 'studentId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        },
        { path: 'courseId', select: 'name code credits department' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Enrollment.countDocuments(query);

    res.status(StatusCodes.OK).json({
      success: true,
      count: enrollments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limitNum),
      data: enrollments
    });
  } catch (error) {
    console.error('Get all enrollments error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: 'Failed to fetch enrollments'
    });
  }
};

const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestError('Invalid enrollment ID format');
    }

    const enrollment = await Enrollment.findById(id)
      .populate([
        { 
          path: 'studentId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        },
        { 
          path: 'courseId',
          populate: {
            path: 'teacherId',
            populate: {
              path: 'userId',
              select: 'firstName lastName'
            }
          }
        }
      ])
      .lean();

    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Get enrollment by id error:', error);
    throw error;
  }
};

const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestError('Invalid enrollment ID format');
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    if (updateData.status === 'completed' && enrollment.status !== 'completed') {
      updateData.completionDate = Date.now();
    }

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    ).populate([
      { 
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      },
      { path: 'courseId', select: 'name code credits' }
    ]).lean();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Enrollment updated successfully',
      data: updatedEnrollment
    });
  } catch (error) {
    console.error('Update enrollment error:', error);
    throw error;
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestError('Invalid enrollment ID format');
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    await Enrollment.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Enrollment removed successfully'
    });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    throw error;
  }
};

const getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    const resolvedStudentId = await resolveStudentId(studentId);
    if (!resolvedStudentId) {
      throw new NotFoundError('Student not found');
    }

    const student = await Student.findById(resolvedStudentId).lean();
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const query = { studentId: resolvedStudentId };
    if (status) query.status = status;

    const enrollments = await Enrollment.find(query)
      .populate([
        { 
          path: 'courseId',
          populate: {
            path: 'teacherId',
            populate: {
              path: 'userId',
              select: 'firstName lastName'
            }
          }
        }
      ])
      .sort({ createdAt: -1 })
      .lean();

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const inProgressCourses = enrollments.filter(e => e.status === 'enrolled').length;
    
    const avgProgress = enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / totalCourses || 0;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.fullName,
          rollNumber: student.rollNumber,
          class: student.class,
          section: student.section
        },
        statistics: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          averageProgress: Math.round(avgProgress)
        },
        courses: enrollments
      }
    });
  } catch (error) {
    console.error('Get student courses error:', error);
    throw error;
  }
};

const bulkEnroll = async (req, res) => {
  try {
    const { courseId, studentIds } = req.body;

    if (!courseId || !studentIds || !Array.isArray(studentIds)) {
      throw new BadRequestError('Course ID and student IDs array are required');
    }

    const resolvedCourseId = await resolveCourseId(courseId);
    if (!resolvedCourseId) {
      throw new NotFoundError('Course not found');
    }

    const course = await Course.findById(resolvedCourseId).lean();
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const studentIdentifier of studentIds) {
      try {
        const resolvedStudentId = await resolveStudentId(studentIdentifier);
        if (!resolvedStudentId) {
          results.failed.push({
            studentId: studentIdentifier,
            reason: 'Student not found'
          });
          continue;
        }

        const existing = await Enrollment.findOne({
          studentId: resolvedStudentId,
          courseId: resolvedCourseId,
          status: { $in: ['enrolled', 'completed'] }
        }).lean();

        if (existing) {
          results.failed.push({
            studentId: studentIdentifier,
            reason: 'Already enrolled'
          });
          continue;
        }

        const enrolledCount = await Enrollment.countDocuments({
          courseId: resolvedCourseId,
          status: 'enrolled'
        });

        if (enrolledCount >= course.maxStudents) {
          results.failed.push({
            studentId: studentIdentifier,
            reason: 'Course full'
          });
          continue;
        }

        const enrollment = await Enrollment.create({
          studentId: resolvedStudentId,
          courseId: resolvedCourseId,
          status: 'enrolled'
        });

        results.successful.push({
          studentId: studentIdentifier,
          enrollmentId: enrollment._id
        });
      } catch (error) {
        results.failed.push({
          studentId: studentIdentifier,
          reason: error.message
        });
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Bulk enrollment completed: ${results.successful.length} successful, ${results.failed.length} failed`,
      data: results
    });
  } catch (error) {
    console.error('Bulk enroll error:', error);
    throw error;
  }
};

const selfEnroll = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const { courseId } = req.body;

    console.log("Self enroll request:", { studentId, courseId });

    if (!courseId) {
      throw new BadRequestError('Course ID is required');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.status !== 'active') {
      throw new BadRequestError('This course is not available for enrollment');
    }

    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: { $in: ['enrolled', 'completed'] }
    });

    if (existingEnrollment) {
      throw new BadRequestError('You are already enrolled in this course');
    }

    const enrolledCount = await Enrollment.countDocuments({
      courseId,
      status: 'enrolled'
    });

    if (enrolledCount >= course.maxStudents) {
      throw new BadRequestError('Course has reached maximum capacity');
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      enrollmentDate: Date.now(),
      status: 'enrolled',
      progress: 0,
      grade: 'Not Graded'
    });

    console.log("Enrollment created:", enrollment._id);

    await enrollment.populate([
      { 
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      },
      { path: 'courseId', select: 'name code credits department' }
    ]);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment
    });
  } catch (error) {
    console.error('Self enrollment error:', error);
    throw error;
  }
};

const getStudentEnrollments = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const { status } = req.query;

    const query = { studentId };
    if (status) query.status = status;

    const enrollments = await Enrollment.find(query)
      .populate([
        { path: 'courseId', select: 'name code credits department' },
        { 
          path: 'courseId',
          populate: {
            path: 'teacherId',
            populate: {
              path: 'userId',
              select: 'firstName lastName'
            }
          }
        }
      ])
      .sort({ createdAt: -1 })
      .lean();

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const inProgressCourses = enrollments.filter(e => e.status === 'enrolled').length;
    
    const avgProgress = enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / totalCourses || 0;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        statistics: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          averageProgress: Math.round(avgProgress)
        },
        enrollments
      }
    });
  } catch (error) {
    console.error('Get student enrollments error:', error);
    throw error;
  }
};

module.exports = {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
  getStudentCourses,
  bulkEnroll,
  selfEnroll,
  getStudentEnrollments
};