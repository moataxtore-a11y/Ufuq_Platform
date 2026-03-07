import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import ChangePasswordPage from './pages/ChangePasswordPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppShell from './components/layout/AppShell.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

import AdminOverviewPage from './pages/admin/AdminOverviewPage.jsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx'
import AdminCoursesPage from './pages/admin/AdminCoursesPage.jsx'
import AdminLandingPage from './pages/admin/AdminLandingPage.jsx'
import AdminLandingLayout from './components/layout/AdminLandingLayout.jsx'
import AdminJoinTeachersApplicationsPage from './pages/admin/AdminJoinTeachersApplicationsPage.jsx'
import AdminJoinTeachersApplicationDetailsPage from './pages/admin/AdminJoinTeachersApplicationDetailsPage.jsx'

import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage.jsx'
import TeacherCourseDetailPage from './pages/teacher/TeacherCourseDetailPage.jsx'
import TeacherAssignmentsPage from './pages/teacher/TeacherAssignmentsPage.jsx'
import TeacherGradesPage from './pages/teacher/TeacherGradesPage.jsx'
import TeacherAssessmentsPage from './pages/teacher/TeacherAssessmentsPage.jsx'
import TeacherManualGradingPage from './pages/teacher/TeacherManualGradingPage.jsx'
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage.jsx'
import TeacherTeamPage from './pages/teacher/TeacherTeamPage.jsx'
import TeacherLandingPage from './pages/teacher/TeacherLandingPage.jsx'
import TeacherLandingLayout from './components/layout/TeacherLandingLayout.jsx'
import TeacherAccessCodesPage from './pages/teacher/TeacherAccessCodesPage.jsx'

import TeamQueuePage from './pages/team/TeamQueuePage.jsx'
import ApprovalsPage from './pages/team/ApprovalsPage.jsx'
import TeamAssessmentsPage from './pages/team/TeamAssessmentsPage.jsx'
import TeamManualGradingPage from './pages/team/TeamManualGradingPage.jsx'
import TeamStudentsPage from './pages/team/TeamStudentsPage.jsx'
import TeamCoursesPage from './pages/team/TeamCoursesPage.jsx'
import TeamCourseDetailPage from './pages/team/TeamCourseDetailPage.jsx'
import TeamLandingPage from './pages/team/TeamLandingPage.jsx'
import TeamLandingLayout from './components/layout/TeamLandingLayout.jsx'
import TeamAccessCodesPage from './pages/team/TeamAccessCodesPage.jsx'

import AssessmentReportPage from './pages/shared/AssessmentReportPage.jsx'
import AssessmentEditPage from './pages/shared/AssessmentEditPage.jsx'

import StudentCoursesPage from './pages/student/StudentCoursesPage.jsx'
import StudentCourseDetailPage from './pages/student/StudentCourseDetailPage.jsx'
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage.jsx'
import StudentGradesPage from './pages/student/StudentGradesPage.jsx'
import StudentAssessmentsPage from './pages/student/StudentAssessmentsPage.jsx'
import StudentAssessmentAttemptPage from './pages/student/StudentAssessmentAttemptPage.jsx'
import StudentAssessmentResultPage from './pages/student/StudentAssessmentResultPage.jsx'
import StudentSelectionPage from './pages/student/StudentSelectionPage.jsx'
import StudentLandingPage from './pages/student/StudentLandingPage.jsx'
import StudentTeacherCoursesPage from './pages/student/StudentTeacherCoursesPage.jsx'
import StudentCheckoutPage from './pages/student/StudentCheckoutPage.jsx'
import StudentRedeemCodePage from './pages/student/StudentRedeemCodePage.jsx'
import StudentWalletPage from './pages/student/StudentWalletPage.jsx'
import StudentStatsPage from './pages/student/StudentStatsPage.jsx'
import StudentLandingLayout from './components/layout/StudentLandingLayout.jsx'
import HomePage from './pages/HomePage.jsx'

import PendingApprovalPage from './pages/PendingApprovalPage.jsx'
import AccountRejectedPage from './pages/AccountRejectedPage.jsx'

import TeacherPublicPage from './pages/public/TeacherPublicPage.jsx'
import CoursePreviewPage from './pages/public/CoursePreviewPage.jsx'
import SubjectCoursesPage from './pages/public/SubjectCoursesPage.jsx'
import SearchResultsPage from './pages/public/SearchResultsPage.jsx'
import JoinTeachersPage from './pages/JoinTeachersPage.jsx'
import MotivationalMessageAdminPage from './pages/shared/MotivationalMessageAdminPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/teachers/:teacherId" element={<TeacherPublicPage />} />
      <Route path="/subjects/:subject" element={<SubjectCoursesPage />} />
      <Route path="/courses/:courseId/preview" element={<CoursePreviewPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />
      <Route path="/account-rejected" element={<AccountRejectedPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/join-teachers" element={<JoinTeachersPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppShell titleKey="profile" />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLandingLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminLandingPage />} />
        <Route path="overview" element={<AdminOverviewPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="motivational-message" element={<MotivationalMessageAdminPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="applications" element={<AdminJoinTeachersApplicationsPage />} />
        <Route path="applications/:id" element={<AdminJoinTeachersApplicationDetailsPage />} />
        <Route path="assessments/:assessmentId/report" element={<AssessmentReportPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <ProtectedRoute roles={["teacher"]}>
            <TeacherLandingLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherLandingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="motivational-message" element={<MotivationalMessageAdminPage />} />
        <Route path="courses" element={<TeacherCoursesPage />} />
        <Route path="courses/new" element={<Navigate to="/teacher/courses" replace />} />
        <Route path="courses/:courseId" element={<TeacherCourseDetailPage />} />
        <Route path="access-codes" element={<TeacherAccessCodesPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="assignments" element={<TeacherAssignmentsPage />} />
        <Route path="assessments" element={<TeacherAssessmentsPage />} />
        <Route path="assessments/all" element={<TeacherAssessmentsPage />} />
        <Route path="assessments/course/:courseId" element={<TeacherAssessmentsPage />} />
        <Route path="assessments/:assessmentId/edit" element={<AssessmentEditPage />} />
        <Route path="assessments/:assessmentId/report" element={<AssessmentReportPage />} />
        <Route path="assessments/grading" element={<TeacherManualGradingPage />} />
        <Route path="students" element={<TeacherStudentsPage />} />
        <Route path="team" element={<TeacherTeamPage />} />
        <Route path="grades" element={<TeacherGradesPage />} />
      </Route>

      <Route
        path="/team"
        element={
          <ProtectedRoute roles={["team"]}>
            <TeamLandingLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeamLandingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="motivational-message" element={<MotivationalMessageAdminPage />} />
        <Route path="queue" element={<TeamQueuePage />} />
        <Route path="courses" element={<TeamCoursesPage />} />
        <Route path="courses/:courseId" element={<TeamCourseDetailPage />} />
        <Route path="access-codes" element={<TeamAccessCodesPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="assessments" element={<TeamAssessmentsPage />} />
        <Route path="assessments/all" element={<TeamAssessmentsPage />} />
        <Route path="assessments/course/:courseId" element={<TeamAssessmentsPage />} />
        <Route path="assessments/:assessmentId/edit" element={<AssessmentEditPage />} />
        <Route path="assessments/:assessmentId/report" element={<AssessmentReportPage />} />
        <Route path="assessments/grading" element={<TeamManualGradingPage />} />
        <Route path="students" element={<TeamStudentsPage />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentLandingLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentLandingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route path="select" element={<StudentSelectionPage />} />
        <Route path="courses/:courseId" element={<StudentCourseDetailPage />} />
        <Route path="checkout/:courseId" element={<StudentCheckoutPage />} />
        <Route path="wallet" element={<StudentWalletPage />} />
        <Route path="stats" element={<StudentStatsPage />} />
        <Route path="redeem" element={<StudentRedeemCodePage />} />
        <Route path="teachers/:teacherId" element={<StudentTeacherCoursesPage />} />
        <Route path="assignments" element={<StudentAssignmentsPage />} />
        <Route path="assessments" element={<StudentAssessmentsPage />} />
        <Route path="assessments/:assessmentId/attempt" element={<StudentAssessmentAttemptPage />} />
        <Route path="assessments/attempts/:attemptId/result" element={<StudentAssessmentResultPage />} />
        <Route path="grades" element={<StudentGradesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
