// Path: js/cv.js
// Handles CV form submission, validation, rendering, edit, and simple download as HTML snapshot.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cv-form');
  const preview = document.getElementById('cv-preview');
  const editBtn = document.getElementById('edit-btn');
  const clearBtn = document.getElementById('clear-btn');
  const downloadLink = document.getElementById('download-link');

  function setText(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text || '';
  }

  function listToItems(text) {
    if (!text) return [];
    return text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  function skillsToSpan(text) {
    if (!text) return '';
    return text.split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="skills-pill">${escapeHTML(s)}</span>`).join(' ');
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[tag]));
  }

  function renderPreview(data) {
    setText('cv-name', data.fullName);
    setText('cv-contact', `${data.email}${data.phone ? ' • ' + data.phone : ''}`);
    setText('cv-summary', data.summary || '');

    const eduList = document.getElementById('cv-education');
    eduList.innerHTML = '';
    listToItems(data.education).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      eduList.appendChild(li);
    });

    const expList = document.getElementById('cv-experience');
    expList.innerHTML = '';
    listToItems(data.experience).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      expList.appendChild(li);
    });

    document.getElementById('cv-skills').innerHTML = skillsToSpan(data.skills);

    const projectsArr = listToItems(data.projects);
    const projBlock = document.getElementById('cv-projects-block');
    const projList = document.getElementById('cv-projects');
    projList.innerHTML = '';
    if (projectsArr.length) {
      projBlock.style.display = '';
      projectsArr.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        projList.appendChild(li);
      });
    } else {
      projBlock.style.display = 'none';
    }

    preview.hidden = false;
    editBtn.style.display = '';
    // build download snapshot
    buildDownload(data);
  }

  function buildDownload(data) {
    // Simple HTML snapshot using current rendered content
    const html = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CV — ${escapeHTML(data.fullName)}</title>
<link rel="stylesheet" href="../style.css">
</head><body>
<main>
  <h1>${escapeHTML(data.fullName)}</h1>
  <p>${escapeHTML(data.email)}${data.phone ? ' • '+escapeHTML(data.phone):''}</p>
  <p>${escapeHTML(data.summary || '')}</p>
  <h2>Education</h2><ul>${listToItems(data.education).map(i=>`<li>${escapeHTML(i)}</li>`).join('')}</ul>
  <h2>Experience</h2><ul>${listToItems(data.experience).map(i=>`<li>${escapeHTML(i)}</li>`).join('')}</ul>
  <h2>Skills</h2><p>${escapeHTML(data.skills || '')}</p>
  ${data.projects ? `<h2>Projects & Certifications</h2><ul>${listToItems(data.projects).map(i=>`<li>${escapeHTML(i)}</li>`).join('')}</ul>` : ''}
</main>
<footer><small>Generated from CV Entry — Last updated: 11 November 2025.</small></footer>
</body></html>
`;
    const blob = new Blob([html], {type:'text/html'});
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.addEventListener('click', () => {
      setTimeout(() => URL.revokeObjectURL(downloadLink.href), 5000);
    }, {once:true});
  }

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    // basic validation
    const formData = new FormData(form);
    const fullName = formData.get('fullName').trim();
    const email = formData.get('email').trim();

    if (!fullName) {
      alert('Full name is required.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email.');
      return;
    }

    const data = {
      fullName,
      email,
      phone: (formData.get('phone') || '').trim(),
      summary: (formData.get('summary') || '').trim(),
      education: (formData.get('education') || '').trim(),
      experience: (formData.get('experience') || '').trim(),
      skills: (formData.get('skills') || '').trim(),
      projects: (formData.get('projects') || '').trim()
    };

    // store to session so user can edit
    sessionStorage.setItem('cvData', JSON.stringify(data));
    renderPreview(data);
    // optionally scroll to preview
    preview.scrollIntoView({behavior:'smooth'});
  });

  editBtn.addEventListener('click', () => {
    const raw = sessionStorage.getItem('cvData');
    if (!raw) return;
    const data = JSON.parse(raw);
    // populate form
    form.elements['fullName'].value = data.fullName || '';
    form.elements['email'].value = data.email || '';
    form.elements['phone'].value = data.phone || '';
    form.elements['summary'].value = data.summary || '';
    form.elements['education'].value = data.education || '';
    form.elements['experience'].value = data.experience || '';
    form.elements['skills'].value = data.skills || '';
    form.elements['projects'].value = data.projects || '';

    preview.hidden = true;
    editBtn.style.display = 'none';
  });

  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear the form and preview?')) return;
    form.reset();
    preview.hidden = true;
    editBtn.style.display = 'none';
    sessionStorage.removeItem('cvData');
  });

  // load if session exists
  const raw = sessionStorage.getItem('cvData');
  if (raw) renderPreview(JSON.parse(raw));
});
