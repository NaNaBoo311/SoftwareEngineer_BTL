import { useState } from 'react';

const CourseFeedback = ({ courseTitle }) => {
  // Mock data - in a real app, this would come from an API
  const [courseEnded] = useState(true); // Course has ended
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [feedback, setFeedback] = useState({
    overallRating: 0,
    contentQuality: 0,
    tutorPerformance: 0,
    resourceQuality: 0,
    courseStructure: 0,
    difficultyLevel: 0,
    generalComment: '',
    strengths: '',
    improvements: '',
    recommendToOthers: null, // true/false/null
  });

  const [previousFeedback, setPreviousFeedback] = useState(null);

  const StarRating = ({ value, onChange, label, description }) => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-base font-semibold text-gray-900">{label}</label>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <span className="text-sm text-gray-600">{value > 0 ? `${value}/5` : 'Not rated'}</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`text-3xl transition-all ${
                star <= value
                  ? 'text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
              disabled={feedbackSubmitted}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = () => {
    // Validate required fields
    if (feedback.overallRating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    // In a real app, this would submit to an API
    setPreviousFeedback({ ...feedback, submittedAt: new Date().toISOString() });
    setFeedbackSubmitted(true);
    setIsEditing(false);
    alert('Thank you for your feedback! Your response has been submitted.');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFeedbackSubmitted(false);
  };

  const handleReset = () => {
    setFeedback({
      overallRating: 0,
      contentQuality: 0,
      tutorPerformance: 0,
      resourceQuality: 0,
      courseStructure: 0,
      difficultyLevel: 0,
      generalComment: '',
      strengths: '',
      improvements: '',
      recommendToOthers: null,
    });
    setFeedbackSubmitted(false);
    setIsEditing(false);
    setPreviousFeedback(null);
  };

  if (!courseEnded) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Still in Progress</h2>
        <p className="text-gray-600 mb-4">
          Course feedback is available after the course has ended.
        </p>
        <p className="text-sm text-gray-500">
          Please complete the course first before submitting your feedback.
        </p>
      </div>
    );
  }

  // Show submitted feedback
  if (previousFeedback && !isEditing) {
    const displayFeedback = previousFeedback;
    
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">✓</div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-1">Feedback Submitted Successfully</h3>
              <p className="text-sm text-green-700">
                Thank you for taking the time to provide your feedback. Your response was submitted on{' '}
                {new Date(displayFeedback.submittedAt).toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>

        {/* Submitted Feedback Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Feedback Summary</h2>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Edit Feedback
            </button>
          </div>

          {/* Ratings Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Overall Rating</div>
              <div className="text-2xl font-bold text-gray-900">
                {'★'.repeat(displayFeedback.overallRating)}{'☆'.repeat(5 - displayFeedback.overallRating)}
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Content Quality</div>
              <div className="text-2xl font-bold text-gray-900">
                {'★'.repeat(displayFeedback.contentQuality)}{'☆'.repeat(5 - displayFeedback.contentQuality)}
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Tutor Performance</div>
              <div className="text-2xl font-bold text-gray-900">
                {'★'.repeat(displayFeedback.tutorPerformance)}{'☆'.repeat(5 - displayFeedback.tutorPerformance)}
              </div>
            </div>
          </div>

          {/* Comments */}
          {displayFeedback.generalComment && (
            <div className="mb-4">
              <h4 className="text-base font-semibold text-gray-900 mb-2">General Comment</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                {displayFeedback.generalComment}
              </div>
            </div>
          )}

          {displayFeedback.strengths && (
            <div className="mb-4">
              <h4 className="text-base font-semibold text-gray-900 mb-2">Strengths</h4>
              <div className="bg-green-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                {displayFeedback.strengths}
              </div>
            </div>
          )}

          {displayFeedback.improvements && (
            <div className="mb-4">
              <h4 className="text-base font-semibold text-gray-900 mb-2">Areas for Improvement</h4>
              <div className="bg-yellow-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                {displayFeedback.improvements}
              </div>
            </div>
          )}

          {displayFeedback.recommendToOthers !== null && (
            <div className="mt-4">
              <h4 className="text-base font-semibold text-gray-900 mb-2">Would you recommend this course?</h4>
              <div className={`inline-block px-4 py-2 rounded-lg font-medium ${
                displayFeedback.recommendToOthers
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {displayFeedback.recommendToOthers ? '✓ Yes' : '✗ No'}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Feedback Form
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Feedback</h2>
        <p className="text-gray-600">
          Your feedback helps us improve the course quality and learning experience. 
          Please take a few minutes to share your thoughts about this course.
        </p>
      </div>

      {/* Feedback Form */}
      <form className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="space-y-6">
          {/* Overall Rating */}
          <div className="border-b border-gray-200 pb-6">
            <StarRating
              value={feedback.overallRating}
              onChange={(value) => setFeedback({ ...feedback, overallRating: value })}
              label="Overall Course Rating"
              description="Rate your overall experience with this course"
            />
          </div>

          {/* Detailed Ratings */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Ratings</h3>
            
            <StarRating
              value={feedback.contentQuality}
              onChange={(value) => setFeedback({ ...feedback, contentQuality: value })}
              label="Content Quality"
              description="How would you rate the course content and materials?"
            />

            <StarRating
              value={feedback.tutorPerformance}
              onChange={(value) => setFeedback({ ...feedback, tutorPerformance: value })}
              label="Tutor Performance"
              description="How would you rate the instructor's teaching effectiveness?"
            />

            <StarRating
              value={feedback.resourceQuality}
              onChange={(value) => setFeedback({ ...feedback, resourceQuality: value })}
              label="Learning Resources"
              description="How useful were the provided resources and materials?"
            />

            <StarRating
              value={feedback.courseStructure}
              onChange={(value) => setFeedback({ ...feedback, courseStructure: value })}
              label="Course Structure"
              description="How well-organized was the course structure and schedule?"
            />

            <StarRating
              value={feedback.difficultyLevel}
              onChange={(value) => setFeedback({ ...feedback, difficultyLevel: value })}
              label="Difficulty Level"
              description="Was the difficulty level appropriate for the course?"
            />
          </div>

          {/* Text Feedback */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Written Feedback</h3>

            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-900 mb-2">
                General Comments
              </label>
              <textarea
                value={feedback.generalComment}
                onChange={(e) => setFeedback({ ...feedback, generalComment: e.target.value })}
                placeholder="Share your overall thoughts and experience about the course..."
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Strengths
              </label>
              <textarea
                value={feedback.strengths}
                onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })}
                placeholder="What did you like most about the course? What were its strengths?"
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Areas for Improvement
              </label>
              <textarea
                value={feedback.improvements}
                onChange={(e) => setFeedback({ ...feedback, improvements: e.target.value })}
                placeholder="What aspects of the course could be improved? Any suggestions?"
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          {/* Recommendation */}
          <div className="pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation</h3>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Would you recommend this course to other students?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFeedback({ ...feedback, recommendToOthers: true })}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  feedback.recommendToOthers === true
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                }`}
              >
                ✓ Yes
              </button>
              <button
                type="button"
                onClick={() => setFeedback({ ...feedback, recommendToOthers: false })}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  feedback.recommendToOthers === false
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100'
                }`}
              >
                ✗ No
              </button>
              <button
                type="button"
                onClick={() => setFeedback({ ...feedback, recommendToOthers: null })}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  feedback.recommendToOthers === null
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                Not Sure
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {previousFeedback && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Reset Form
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={feedback.overallRating === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CourseFeedback;

