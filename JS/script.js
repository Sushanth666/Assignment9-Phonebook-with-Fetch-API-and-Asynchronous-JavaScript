document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const nameInput = document.getElementById('nameInput');
  const phoneInput = document.getElementById('phoneInput');
  const contactList = document.getElementById('contactList');
  const errorMessage = document.getElementById('errorMessage');

  // Load existing contacts on page load
  loadContacts();

  // Submit handler to add new contact
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!validateName(name)) {
      showError('Please enter a valid name (at least 2 characters).');
      return;
    }

    if (!validatePhone(phone)) {
      showError('Please enter a valid Indian phone number.');
      return;
    }

    // Format the phone number as '+91 9876543210'
    const formattedPhone = formatPhone(phone);

    const contact = { name, phone: formattedPhone };

    try {
      await addContact(contact);
      contactForm.reset();
      nameInput.focus();
    } catch (error) {
      showError(error.message || 'Failed to add contact. Please try again.');
      console.error(error);
    }
  });

  // Validate Indian phone number with optional country code (+91 or 0)
  function validatePhone(phone) {
    const regex = /^(?:\+91[\-\s]?|91[\-\s]?|0)?[6-9]\d{9}$/;
    return regex.test(phone);
  }

  // Simple name validation (at least 2 characters)
  function validateName(name) {
    return name.length >= 2;
  }

  // Display error message
  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
  }

  // Clear error message
  function clearError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
  }

  // Load contacts from localStorage and render
  function loadContacts() {
    const contactsJSON = localStorage.getItem('contacts');
    const contacts = contactsJSON ? JSON.parse(contactsJSON) : [];
    renderContacts(contacts);
  }

  // Save contacts to localStorage
  function saveContacts(contacts) {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }

  // Add contact asynchronously (simulate Fetch API)
  async function addContact(contact) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const contactsJSON = localStorage.getItem('contacts');
    const contacts = contactsJSON ? JSON.parse(contactsJSON) : [];

    // Check for duplicate phone number
    if (contacts.some(c => c.phone === contact.phone)) {
      throw new Error('Phone number already exists.');
    }

    contacts.push({ id: Date.now(), ...contact });
    saveContacts(contacts);
    renderContacts(contacts);
  }

  // Delete contact by id asynchronously (simulate Fetch API)
  async function deleteContact(id) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    let contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    contacts = contacts.filter((c) => c.id !== id);
    saveContacts(contacts);
    renderContacts(contacts);
  }

  // Render contacts list UI
  function renderContacts(contacts) {
    contactList.innerHTML = '';
    if (contacts.length === 0) {
      contactList.innerHTML = '<li class="list-group-item text-center text-muted">No contacts found</li>';
      return;
    }

    contacts.forEach(({ id, name, phone }) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.dataset.id = id;

      li.innerHTML = `
        <div>
          <strong>${escapeHTML(name)}</strong> - <span>${escapeHTML(phone)}</span>
        </div>
        <button class="btn btn-sm btn-danger delete-btn" aria-label="Delete contact">Delete</button>
      `;

      // Attach the delete event handler
      li.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm(`Delete contact "${name}"?`)) {
          deleteContact(id).catch((err) => {
            showError('Failed to delete contact. Please try again.');
            console.error(err);
          });
        }
      });

      contactList.appendChild(li);
    });
  }

  // Format phone to standard Indian format: +91 9876543210
  // Accepts phone as string with optional +91 or 0 prefix
  function formatPhone(phone) {
    // Remove spaces, hyphens, parentheses
    phone = phone.replace(/[\s\-\(\)]/g, '');

    // Remove country code or leading zero
    if (phone.startsWith('+91')) {
      phone = phone.slice(3);
    } else if (phone.startsWith('91')) {
      phone = phone.slice(2);
    } else if (phone.startsWith('0')) {
      phone = phone.slice(1);
    }

    // Only keep last 10 digits (if user enters extra digits accidentally)
    phone = phone.slice(-10);

    // Return '+91 ' plus 10 digit number
    return '+91 ' + phone;
  }

  // Simple HTML escaping to prevent injection
  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
