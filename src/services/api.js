// API Client for Hypothesis Gate

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('hg_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // Handle file/blob responses (e.g. PDF download)
  if (options.responseType === 'blob') {
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Download failed' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.blob();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Projects
  createProject: (projectData) => request('/projects', { method: 'POST', body: JSON.stringify(projectData) }),
  getStudentProjects: () => request('/projects'),
  getProjectById: (id) => request(`/projects/${id}`),
  updateProject: (id, projectData) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(projectData) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Research Analysis (OpenAlex)
  searchLiterature: (query, page = 1) => request(`/research/search?query=${encodeURIComponent(query)}&page=${page}`),
  comparePaper: (projectId, paper) => request(`/research/projects/${projectId}/compare`, { method: 'POST', body: JSON.stringify({ paper }) }),
  savePaper: (projectId, paperData) => request(`/research/projects/${projectId}/papers`, { method: 'POST', body: JSON.stringify(paperData) }),
  getSavedPapers: (projectId) => request(`/research/projects/${projectId}/papers`),
  deletePaper: (projectId, paperId) => request(`/research/projects/${projectId}/papers/${paperId}`, { method: 'DELETE' }),

  // Validation
  runValidation: (projectId) => request(`/validation/projects/${projectId}`, { method: 'POST' }),
  getValidation: (projectId) => request(`/validation/projects/${projectId}`),

  // Mentors
  getMentorRecommendations: (projectId) => request(`/mentors/projects/${projectId}/recommendations`),
  requestMentor: (projectId, data) => request(`/mentors/projects/${projectId}/request`, { method: 'POST', body: JSON.stringify(data) }),
  getIncomingRequests: () => request('/mentors/requests'),
  respondToRequest: (requestId, responseData) => request(`/mentors/requests/${requestId}/respond`, { method: 'POST', body: JSON.stringify(responseData) }),
  getAssignedProjects: () => request('/mentors/assigned-projects'),
  submitReview: (projectId, reviewData) => request(`/mentors/projects/${projectId}/review`, { method: 'POST', body: JSON.stringify(reviewData) }),

  // Hypothesis Lab
  createHypothesis: (projectId, data) => request(`/lab/projects/${projectId}/hypotheses`, { method: 'POST', body: JSON.stringify(data) }),
  getHypotheses: (projectId) => request(`/lab/projects/${projectId}/hypotheses`),
  createExperiment: (projectId, data) => request(`/lab/projects/${projectId}/experiments`, { method: 'POST', body: JSON.stringify(data) }),
  getExperiments: (projectId) => request(`/lab/projects/${projectId}/experiments`),
  updateExperiment: (experimentId, data) => request(`/lab/experiments/${experimentId}`, { method: 'PUT', body: JSON.stringify(data) }),
  mentorReviewExperiment: (experimentId, data) => request(`/lab/experiments/${experimentId}/mentor-review`, { method: 'POST', body: JSON.stringify(data) }),

  // Version History
  getVersions: (projectId) => request(`/history/projects/${projectId}/versions`),
  getVersionById: (projectId, versionId) => request(`/history/projects/${projectId}/versions/${versionId}`),
  createSnapshot: (projectId, data) => request(`/history/projects/${projectId}/versions/snapshot`, { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  getReportData: (projectId) => request(`/reports/projects/${projectId}/data`),
  downloadReportPdf: (projectId) => request(`/reports/projects/${projectId}/pdf`, { responseType: 'blob' })
};
