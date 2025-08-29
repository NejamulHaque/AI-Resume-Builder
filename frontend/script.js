// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
const elements = {
  // Auth Forms
  loginForm: document.getElementById('loginForm'),
  signupForm: document.getElementById('signupForm'),
  resetForm: document.getElementById('resetForm'),
  adminLoginForm: document.getElementById('adminLoginForm'),

  // Resume Builder
  generateResumeBtn: document.getElementById('generate-resume'),
  templateSelectorBtn: document.getElementById('template-selector-btn'),
  templatesModal: document.getElementById('templates-modal'),
  closeTemplatesBtn: document.getElementById('close-templates'),
  addEducationBtn: document.getElementById('add-education'),
  addExperienceBtn: document.getElementById('add-experience'),
  addProjectBtn: document.getElementById('add-project'),
  submitSkillBtn: document.getElementById('submit-skill'),
  newSkillInput: document.getElementById('new-skill'),

  // Contact Form
  contactForm: document.getElementById('contactForm'),
  formResponse: document.getElementById('form-response'),

  // Admin Dashboard
  showArchivedCheckbox: document.getElementById('showArchived'),
  messagesContainer: document.getElementById('messages-container'),

  // Preview Elements
  previewName: document.getElementById('preview-name'),
  previewContact: document.getElementById('preview-contact'),
  previewSummary: document.getElementById('preview-summary'),
  previewEducation: document.getElementById('preview-education'),
  previewExperience: document.getElementById('preview-experience')
};

// Utility Functions
const utils = {
  showToast: (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white flex items-center`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  handleApiResponse: async (response) => {
    const contentType = response.headers.get('content-type');
    
    // Handle non-JSON responses
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(text || 'Unexpected server response');
    }

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.message || 'Request failed');
      error.response = response;
      error.data = data;
      throw error;
    }

    return data;
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      utils.showToast('Please login to continue', 'error');
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// Authentication Module
const auth = {
  login: async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await utils.handleApiResponse(response);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      
      utils.showToast('Login successful!', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);

    } catch (error) {
      console.error('Login Error:', error);
      utils.showToast(
        error.message || 'Invalid credentials. Please try again.',
        'error'
      );
    }
  },

  signup: async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    // Client-side validation
    if (!name || !email || !password) {
      utils.showToast('Please fill in all fields', 'error');
      return;
    }

    if (!utils.validateEmail(email)) {
      utils.showToast('Please enter a valid email', 'error');
      return;
    }

    if (password.length < 6) {
      utils.showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await utils.handleApiResponse(response);
      
      utils.showToast(data.message || 'Account created successfully!', 'success');
      setTimeout(() => window.location.href = 'login.html', 1500);

    } catch (error) {
      console.error('Signup Error:', error);
      utils.showToast(
        error.message || 'Signup failed. Please try again.', 
        'error'
      );
    }
  },

  resetPassword: async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    if (!email) {
      utils.showToast('Please enter your email', 'error');
      return;
    }

    if (!utils.validateEmail(email)) {
      utils.showToast('Please enter a valid email', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await utils.handleApiResponse(response);
      
      utils.showToast(data.message || 'Password reset link sent to your email', 'success');
      e.target.reset();

    } catch (error) {
      console.error('Reset Password Error:', error);
      utils.showToast(
        error.message || 'Failed to send reset link', 
        'error'
      );
    }
  },

  adminLogin: (e) => {
    e.preventDefault();
    const password = e.target['admin-password'].value;
    if (password === 'haque2024') { // In production, use environment variable
      sessionStorage.setItem('isAdmin', 'true');
      window.location.href = 'admincontactdashboard.html';
    } else {
      document.getElementById('login-error').classList.remove('hidden');
    }
  }
};

// Resume Builder Module
const resumeBuilder = {
  collectResumeData: () => {
    return {
      fullName: document.getElementById('full-name')?.value,
      email: document.getElementById('email')?.value,
      phone: document.getElementById('phone-number')?.value,
      linkedin: document.getElementById('linkedin-profile')?.value,
      summary: document.getElementById('professional-summary')?.value,
      education: Array.from(document.querySelectorAll('.education-item')).map(item => {
        const inputs = item.querySelectorAll('input');
        return {
          institution: inputs[0]?.value,
          degree: inputs[1]?.value,
          field: inputs[2]?.value,
          year: inputs[3]?.value
        };
      }),
      experience: Array.from(document.querySelectorAll('.experience-item')).map(item => {
        const inputs = item.querySelectorAll('input');
        const textarea = item.querySelector('textarea');
        return {
          jobTitle: inputs[0]?.value,
          company: inputs[1]?.value,
          start: inputs[2]?.value,
          end: inputs[3]?.value,
          responsibilities: textarea?.value
        };
      }),
      skills: Array.from(document.querySelectorAll('.skill-item span')).map(skill => skill.textContent),
      projects: Array.from(document.querySelectorAll('.project-item')).map(item => {
        const inputs = item.querySelectorAll('input');
        const textarea = item.querySelector('textarea');
        return {
          name: inputs[0]?.value,
          url: inputs[1]?.value,
          description: textarea?.value
        };
      })
    };
  },

  saveResume: async () => {
    if (!utils.checkAuth()) return;

    const resumeData = resumeBuilder.collectResumeData();

    // Validation
    if (!resumeData.fullName || !resumeData.email) {
      utils.showToast('Please fill in required fields (Name and Email)', 'error');
      return;
    }

    if (resumeData.education.length === 0) {
      utils.showToast('Please add at least one education entry', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/resume/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...utils.getAuthHeader()
        },
        body: JSON.stringify(resumeData)
      });

      const data = await utils.handleApiResponse(response);
      
      utils.showToast('Resume saved successfully!', 'success');
      setTimeout(() => window.location.href = 'myresumes.html', 1500);

    } catch (error) {
      console.error('Save Resume Error:', error);
      utils.showToast(
        error.message || 'Failed to save resume', 
        'error'
      );
    }
  },

  loadResumes: async () => {
    if (!utils.checkAuth()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/resume/my-resumes`, {
        headers: utils.getAuthHeader()
      });

      const data = await utils.handleApiResponse(response);
      const container = document.getElementById('resume-list');
      
      if (!data.length) {
        container.innerHTML = '<p class="text-gray-600 py-4 text-center">No resumes found. Create your first resume!</p>';
        return;
      }

      container.innerHTML = data.map(resume => `
        <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition mb-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-purple-700">${resume.fullName || 'Untitled Resume'}</h3>
              <p class="text-sm text-gray-600">${resume.email || ''}</p>
              <p class="text-sm mt-2 text-gray-700">${resume.summary?.substring(0, 100) || 'No summary provided'}...</p>
            </div>
            <div class="flex space-x-2">
              <button onclick="resumeBuilder.viewResume('${resume._id}')" class="text-purple-600 hover:text-purple-800 px-3 py-1 rounded">
                <i class="fas fa-eye"></i>
              </button>
              <button onclick="resumeBuilder.deleteResume('${resume._id}')" class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            Last updated: ${new Date(resume.updatedAt || resume.createdAt).toLocaleString()}
          </p>
        </div>
      `).join('');
    } catch (error) {
      console.error('Load Resumes Error:', error);
      utils.showToast(
        error.message || 'Failed to load resumes', 
        'error'
      );
    }
  },

  deleteResume: async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    if (!utils.checkAuth()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/resume/${id}`, {
        method: 'DELETE',
        headers: utils.getAuthHeader()
      });

      await utils.handleApiResponse(response);
      utils.showToast('Resume deleted successfully', 'success');
      resumeBuilder.loadResumes();
    } catch (error) {
      console.error('Delete Resume Error:', error);
      utils.showToast(
        error.message || 'Failed to delete resume', 
        'error'
      );
    }
  },

  updatePreview: () => {
    const data = resumeBuilder.collectResumeData();
    
    if (elements.previewName) elements.previewName.textContent = data.fullName || 'Your Name';
    if (elements.previewContact) {
      elements.previewContact.textContent = 
        `${data.email || 'email@example.com'} | ${data.phone || '(123) 456-7890'} | ${data.linkedin || 'linkedin.com/in/yourprofile'}`;
    }
    if (elements.previewSummary) elements.previewSummary.textContent = data.summary || 'Brief professional summary goes here...';

    if (elements.previewEducation) {
      elements.previewEducation.innerHTML = data.education.length 
        ? data.education.map(edu => `
            <div class="mb-3 pb-2 border-b border-gray-100">
              <h4 class="font-semibold">${edu.institution || 'Institution'}</h4>
              <p class="text-sm">${edu.degree || 'Degree'} in ${edu.field || 'Field of Study'}</p>
              <p class="text-xs text-gray-500">${edu.year || 'Year'}</p>
            </div>
          `).join('')
        : '<p class="text-gray-500 italic">Your education details will appear here</p>';
    }

    if (elements.previewExperience) {
      elements.previewExperience.innerHTML = data.experience.length
        ? data.experience.map(exp => `
            <div class="mb-3 pb-2 border-b border-gray-100">
              <h4 class="font-semibold">${exp.jobTitle || 'Position'} at ${exp.company || 'Company'}</h4>
              <p class="text-sm text-gray-600">${exp.start || 'Start'} - ${exp.end || 'End'}</p>
              <p class="text-sm mt-1">${exp.responsibilities || 'Responsibilities'}</p>
            </div>
          `).join('')
        : '<p class="text-gray-500 italic">Your work experience will appear here</p>';
    }
  }
};

// Contact Form Module
const contactForm = {
  submit: async (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      subject: e.target.subject.value,
      message: e.target.message.value
    };

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      utils.showToast('Please fill in all fields', 'error');
      return;
    }

    if (!utils.validateEmail(formData.email)) {
      utils.showToast('Please enter a valid email', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await utils.handleApiResponse(response);
      
      if (elements.formResponse) {
        elements.formResponse.textContent = data.message || 'Thank you for your message!';
        elements.formResponse.classList.remove('hidden');
        e.target.reset();
      }
      utils.showToast('Message sent successfully!', 'success');
    } catch (error) {
      console.error('Contact Form Error:', error);
      utils.showToast(
        error.message || 'Failed to send message', 
        'error'
      );
    }
  },

  fetchMessages: async () => {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      window.location.href = 'adminlogin.html';
      return;
    }

    try {
      const archived = elements.showArchivedCheckbox?.checked;
      const response = await fetch(`${API_BASE_URL}/contact?archived=${archived}`);
      const messages = await utils.handleApiResponse(response);

      if (!elements.messagesContainer) return;

      elements.messagesContainer.innerHTML = messages.length
        ? messages.map(msg => `
            <div class="bg-white p-6 rounded-lg shadow-md border-l-4 ${
              msg.archived ? 'border-gray-400' : 'border-purple-500'
            } relative mb-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-bold">${msg.subject}</h3>
                  <p class="text-sm text-gray-600">From: ${msg.name} &lt;${msg.email}&gt;</p>
                </div>
                <span class="text-xs text-gray-500">
                  ${new Date(msg.submittedAt).toLocaleString()}
                </span>
              </div>
              <div class="mt-3 p-3 bg-gray-50 rounded">
                <p>${msg.message}</p>
              </div>
              <div class="mt-3 flex justify-end space-x-2">
                <button onclick="contactForm.archiveMessage('${msg._id}', ${!msg.archived})" 
                  class="px-3 py-1 rounded ${
                    msg.archived 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }">
                  ${msg.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button onclick="contactForm.deleteMessage('${msg._id}')" 
                  class="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">
                  Delete
                </button>
              </div>
            </div>
          `).join('')
        : '<p class="text-gray-600 py-8 text-center">No messages found</p>';
    } catch (error) {
      console.error('Fetch Messages Error:', error);
      utils.showToast(
        error.message || 'Failed to load messages', 
        'error'
      );
    }
  },

  deleteMessage: async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: 'DELETE'
      });

      await utils.handleApiResponse(response);
      utils.showToast('Message deleted successfully', 'success');
      contactForm.fetchMessages();
    } catch (error) {
      console.error('Delete Message Error:', error);
      utils.showToast(
        error.message || 'Failed to delete message', 
        'error'
      );
    }
  },

  archiveMessage: async (id, archive) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: archive })
      });

      await utils.handleApiResponse(response);
      utils.showToast(`Message ${archive ? 'archived' : 'unarchived'} successfully`, 'success');
      contactForm.fetchMessages();
    } catch (error) {
      console.error('Archive Message Error:', error);
      utils.showToast(
        error.message || `Failed to ${archive ? 'archive' : 'unarchive'} message`, 
        'error'
      );
    }
  }
};

// Form Builder Module
const formBuilder = {
  addEducation: () => {
    const container = document.getElementById('education-container');
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.className = 'education-item mb-6 p-4 border rounded-lg bg-gray-50';
    newItem.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-gray-700 mb-1 text-sm font-medium">Institution</label>
          <input type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm">
        </div>
        <div>
          <label class="block text-gray-700 mb-1 text-sm font-medium">Degree</label>
          <input type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm">
        </div>
        <div>
          <label class="block text-gray-700 mb-1 text-sm font-medium">Field of Study</label>
          <input type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm">
        </div>
        <div>
          <label class="block text-gray-700 mb-1 text-sm font-medium">Graduation Year</label>
          <input type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm">
        </div>
      </div>
      <button class="remove-btn text-red-600 hover:text-red-800 text-sm flex items-center">
        <i class="fas fa-trash mr-1"></i> Remove Education
      </button>
    `;
    
    container.appendChild(newItem);
    newItem.querySelector('.remove-btn').addEventListener('click', () => {
      container.removeChild(newItem);
      resumeBuilder.updatePreview();
    });
  },

  addExperience: () => {
    const container = document.getElementById('experience-container');
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.className = 'experience-item mb-6 p-4 border rounded-lg bg-gray-50';
    newItem.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-gray-700 mb-1 text-sm font-medium">Job Title</label>
          <input type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm">
        </div>
        <div>
          <label class="block text-gray-700 mb-1 text-sm font-medium">Company</label>
          <input type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm">
        </div>
        <div>
          <label class="block text-gray-700 mb-1 text-sm font-medium">Start Date</label>
          <input type="date" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm">
        </div>
        <div>
          <label class="block text-gray-700 mb-1 text-sm font-medium">End Date</label>
          <input type="date" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm">
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 mb-1 text-sm font-medium">Responsibilities</label>
        <textarea class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm" rows="3"></textarea>
      </div>
      <button class="remove-btn text-red-600 hover:text-red-800 text-sm flex items-center">
        <i class="fas fa-trash mr-1"></i> Remove Experience
      </button>
    `;
    
    container.appendChild(newItem);
    newItem.querySelector('.remove-btn').addEventListener('click', () => {
      container.removeChild(newItem);
      resumeBuilder.updatePreview();
    });
  },

  addProject: () => {
    const container = document.getElementById('projects-container');
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.className = 'project-item mb-6 p-4 border rounded-lg bg-gray-50';
    newItem.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-gray-700 mb-1 text-sm font-medium">Project Name</label>
          <input type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm">
        </div>
        <div>
          <label class="block text-gray-700 mb-1 text-sm font-medium">Project URL</label>
          <input type="url" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm">
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 mb-1 text-sm font-medium">Description</label>
        <textarea class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm" rows="3"></textarea>
      </div>
      <button class="remove-btn text-red-600 hover:text-red-800 text-sm flex items-center">
        <i class="fas fa-trash mr-1"></i> Remove Project
      </button>
    `;
    
    container.appendChild(newItem);
    newItem.querySelector('.remove-btn').addEventListener('click', () => {
      container.removeChild(newItem);
      resumeBuilder.updatePreview();
    });
  },

  addSkill: () => {
    const skillText = elements.newSkillInput?.value.trim();
    if (!skillText) return;

    const container = document.getElementById('skills-container');
    if (!container) return;

    const newSkill = document.createElement('div');
    newSkill.className = 'skill-item bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center text-sm';
    newSkill.innerHTML = `
      <span>${skillText}</span>
      <button class="ml-2 text-purple-500 hover:text-purple-700 remove-skill">
        <i class="fas fa-times text-xs"></i>
      </button>
    `;
    
    container.appendChild(newSkill);
    elements.newSkillInput.value = '';
    
    newSkill.querySelector('.remove-skill').addEventListener('click', () => {
      container.removeChild(newSkill);
      resumeBuilder.updatePreview();
    });

    resumeBuilder.updatePreview();
  }
};

// Template Module
const templateModule = {
  openModal: () => {
    if (elements.templatesModal) {
      elements.templatesModal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  },

  closeModal: () => {
    if (elements.templatesModal) {
      elements.templatesModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  },

  selectTemplate: (templateName) => {
    utils.showToast(`${templateName} template selected!`, 'success');
    templateModule.closeModal();
  }
};

// Progress Tracker
const progressTracker = {
  update: () => {
    // Personal Info Progress
    const personalInputs = document.querySelectorAll('.personal-info-section input, .personal-info-section textarea');
    let filledPersonal = 0;
    personalInputs.forEach(input => {
      if (input.value.trim()) filledPersonal++;
    });
    const personalPercent = Math.round((filledPersonal / personalInputs.length) * 100);
    
    // Education Progress
    const educationItems = document.querySelectorAll('.education-item');
    const educationPercent = educationItems.length > 0 ? 100 : 0;
    
    // Experience Progress
    const experienceItems = document.querySelectorAll('.experience-item');
    const experiencePercent = experienceItems.length > 0 ? 100 : 0;

    // Update UI
    document.getElementById('personal-progress').textContent = `${personalPercent}%`;
    document.getElementById('personal-progress-bar').style.width = `${personalPercent}%`;
    
    document.getElementById('education-progress').textContent = `${educationPercent}%`;
    document.getElementById('education-progress-bar').style.width = `${educationPercent}%`;
    
    document.getElementById('experience-progress').textContent = `${experiencePercent}%`;
    document.getElementById('experience-progress-bar').style.width = `${experiencePercent}%`;

    // Update overall completion
    const overallPercent = Math.round((personalPercent * 0.4) + (educationPercent * 0.3) + (experiencePercent * 0.3));
    document.getElementById('overall-progress').textContent = `${overallPercent}%`;
    document.getElementById('overall-progress-bar').style.width = `${overallPercent}%`;
  }
};

// Initialize the application
const init = () => {
  // Auth forms
  if (elements.loginForm) elements.loginForm.addEventListener('submit', auth.login);
  if (elements.signupForm) elements.signupForm.addEventListener('submit', auth.signup);
  if (elements.resetForm) elements.resetForm.addEventListener('submit', auth.resetPassword);
  if (elements.adminLoginForm) elements.adminLoginForm.addEventListener('submit', auth.adminLogin);

  // Resume builder
  if (elements.generateResumeBtn) elements.generateResumeBtn.addEventListener('click', resumeBuilder.saveResume);
  if (elements.templateSelectorBtn) elements.templateSelectorBtn.addEventListener('click', templateModule.openModal);
  if (elements.closeTemplatesBtn) elements.closeTemplatesBtn.addEventListener('click', templateModule.closeModal);
  
  // Form builder
  if (elements.addEducationBtn) elements.addEducationBtn.addEventListener('click', formBuilder.addEducation);
  if (elements.addExperienceBtn) elements.addExperienceBtn.addEventListener('click', formBuilder.addExperience);
  if (elements.addProjectBtn) elements.addProjectBtn.addEventListener('click', formBuilder.addProject);
  if (elements.submitSkillBtn) elements.submitSkillBtn.addEventListener('click', formBuilder.addSkill);
  if (elements.newSkillInput) {
    elements.newSkillInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') formBuilder.addSkill();
    });
  }

  // Contact form
  if (elements.contactForm) elements.contactForm.addEventListener('submit', contactForm.submit);

  // Admin dashboard
  if (elements.showArchivedCheckbox) {
    elements.showArchivedCheckbox.addEventListener('change', contactForm.fetchMessages);
  }

  // Template selection
  document.querySelectorAll('.template-card button').forEach(button => {
    button.addEventListener('click', function() {
      const templateName = this.closest('.template-card').querySelector('h4').textContent;
      templateModule.selectTemplate(templateName);
    });
  });

  // Input listeners for real-time updates
  document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      resumeBuilder.updatePreview();
      progressTracker.update();
    });
  });

  // Page-specific initializations
  if (window.location.pathname.includes('myresumes.html')) {
    resumeBuilder.loadResumes();
  }

  if (window.location.pathname.includes('admincontactdashboard.html')) {
    contactForm.fetchMessages();
  }

  // Check auth state for protected pages
  const protectedPages = ['dashboard.html', 'myresumes.html'];
  if (protectedPages.some(page => window.location.pathname.includes(page))) {
    utils.checkAuth();
  }

  // Initial updates
  resumeBuilder.updatePreview();
  progressTracker.update();
};

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Make modules available globally for HTML onclick attributes
window.auth = auth;
window.resumeBuilder = resumeBuilder;
window.contactForm = contactForm;
window.formBuilder = formBuilder;
window.templateModule = templateModule;