/**
 * Explore Sri Lanka – Core JavaScript
 * File:    js/script.js
 * Author:  Web Design Assignment
 * Purpose: Hamburger navigation, destination filter, trip planner logic,
 *          contact form validation, scroll-reveal, back-to-top button.
 */

/* =============================================================
   1. DOCUMENT READY
   ============================================================= */
document.addEventListener('DOMContentLoaded', function () {
  initHamburgerNav();
  initBackToTop();
  initScrollReveal();
  initDestinationFilter();   // destinations.html
  initTripPlanner();         // travel-planner.html
  initContactForm();         // contact.html
  setActiveNavLink();
});


/* =============================================================
   2. HAMBURGER NAVIGATION
   Toggles mobile dropdown menu. Closes on outside click or ESC.
   ============================================================= */
function initHamburgerNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', function () {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    mobileNav.setAttribute('aria-hidden', (!isOpen).toString());
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      closeMobileNav(hamburger, mobileNav);
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMobileNav(hamburger, mobileNav);
    }
  });

  // Close when a mobile nav link is clicked
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileNav(hamburger, mobileNav);
    });
  });
}

function closeMobileNav(hamburger, mobileNav) {
  mobileNav.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileNav.setAttribute('aria-hidden', 'true');
}


/* =============================================================
   3. ACTIVE NAV LINK
   Highlights the current page's nav link.
   ============================================================= */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const allNavLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');

  allNavLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}


/* =============================================================
   4. BACK TO TOP BUTTON
   Appears after scrolling 300px, smooth-scrolls to top on click.
   ============================================================= */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* =============================================================
   5. SCROLL REVEAL
   Adds 'revealed' class to .reveal elements when they enter
   the viewport, triggering CSS fade-in + slide-up transitions.
   ============================================================= */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(function (el) {
    observer.observe(el);
  });
}


/* =============================================================
   6. DESTINATION FILTER (destinations.html)
   Filter buttons show/hide cards by data-category attribute.
   Works alongside jQuery animation in jquery-effects.js.
   ============================================================= */
function initDestinationFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.dest-card');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Update active button
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const category = btn.dataset.filter;

      cards.forEach(function (card) {
        if (category === 'all' || card.dataset.category === category) {
          card.removeAttribute('data-hidden');
          card.style.display = '';
        } else {
          card.setAttribute('data-hidden', 'true');
          card.style.display = 'none';
        }
      });

      // Update no-results message
      const visible = document.querySelectorAll('.dest-card:not([data-hidden])');
      const noResult = document.getElementById('no-results');
      if (noResult) {
        noResult.style.display = visible.length === 0 ? 'block' : 'none';
      }
    });
  });
}


/* =============================================================
   7. INTERACTIVE TRIP PLANNER (travel-planner.html)
   Reads form values and generates a day-by-day itinerary.
   ============================================================= */
function initTripPlanner() {
  const form = document.getElementById('trip-planner-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    generateItinerary();
  });
}

function generateItinerary() {
  // Read form values
  const tripType   = document.getElementById('trip-type')   ? document.getElementById('trip-type').value   : '';
  const numDays    = parseInt(document.getElementById('num-days')    ? document.getElementById('num-days').value    : '5');
  const budget     = document.getElementById('budget-level') ? document.getElementById('budget-level').value : '';
  const locations  = Array.from(document.querySelectorAll('input[name="locations"]:checked')).map(function (cb) { return cb.value; });

  // Validation
  if (!tripType || !budget || locations.length === 0) {
    showPlannerError('Please fill in all fields and select at least one destination.');
    return;
  }

  // Build the itinerary
  const itinerary = buildItinerary(tripType, numDays, budget, locations);

  // Render output
  const outputEl   = document.getElementById('itinerary-output');
  const daysEl     = document.getElementById('itinerary-days');
  const summaryEl  = document.getElementById('itinerary-summary');

  if (!outputEl || !daysEl || !summaryEl) return;

  // Summary line
  const budgetLabels = { budget: 'Budget-Friendly', moderate: 'Moderate', luxury: 'Luxury' };
  const typeLabels   = { adventure: 'Adventure', cultural: 'Cultural & Heritage', beach: 'Beach & Relaxation', family: 'Family' };
  summaryEl.textContent =
    (typeLabels[tripType] || tripType) + ' trip · ' +
    numDays + ' days · ' +
    (budgetLabels[budget] || budget) + ' budget · ' +
    locations.length + ' destination(s)';

  // Render day cards
  daysEl.innerHTML = '';
  itinerary.forEach(function (day) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'itinerary-day';
    dayDiv.innerHTML =
      '<h5>Day ' + day.day + ' – ' + day.location + '</h5>' +
      '<p>' + day.activity + '</p>';
    daysEl.appendChild(dayDiv);
  });

  // Show output panel
  outputEl.classList.add('visible');

  // Smooth scroll to results
  outputEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Clear any previous errors
  clearPlannerError();
}

/**
 * Builds a day-by-day itinerary array based on user selections.
 * Each day object: { day, location, activity }
 */
function buildItinerary(tripType, numDays, budget, locations) {
  // Activity templates keyed by trip type
  var activities = {
    adventure: [
      'Hike through the misty mountains and spot wildlife in the surrounding wilderness.',
      'Rock climbing and zip-lining adventures followed by a sunset viewpoint.',
      'White-water rafting on local rivers and a jungle trek to hidden waterfalls.',
      'Kayaking along the coastline and an evening bonfire on the beach.',
      'Guided mountain bike tour through tea estates and scenic village paths.',
      'Surfing lessons in the morning, coastal wildlife spotting in the afternoon.',
      'Summit hike at dawn, rest day and local exploration in the afternoon.',
      'Deep-sea snorkelling or scuba diving at a coral reef.',
      'Cycling through paddy fields to a remote ancient temple complex.',
      'Tuk-tuk adventure through rural backroads to a hidden lagoon.'
    ],
    cultural: [
      'Guided tour of the ancient rock fortress and surrounding archaeological park.',
      'Visit sacred Buddhist temples, attend a puja ceremony at dusk.',
      'Explore the Dutch colonial fort, browse the artisan market and old streets.',
      'Attend a traditional Kandyan dance performance and visit the Temple of the Tooth.',
      'Half-day cooking class learning to prepare authentic Sri Lankan rice and curry.',
      'Tour the UNESCO World Heritage ruins and museum of the ancient kingdom.',
      'Visit a working tea factory, tour the plantation, and enjoy a tasting session.',
      'Explore local batik-making and handloom weaving craft villages.',
      'Sunrise meditation session at a hilltop monastery with panoramic views.',
      'Heritage walking tour of colonial-era architecture and a local history museum.'
    ],
    beach: [
      'Arrive, settle in, enjoy the beach, watch the sunset over the Indian Ocean.',
      'Snorkelling or glass-bottom boat tour over the coral reef followed by beach picnic.',
      'Day trip to a secluded neighbouring bay accessible only by boat.',
      'Whale and dolphin watching cruise in the morning, beach yoga in the afternoon.',
      'Surfing lessons on world-class waves followed by a beachside seafood dinner.',
      'Visit a sea turtle hatchery and conservation project, evening beach walk.',
      'Kayak along the mangrove lagoon, afternoon swimming and beach volleyball.',
      'Traditional fishing village tour and sunset catamaran sailing trip.',
      'Lazy beach day, read a book, enjoy fresh coconuts and local snacks.',
      'Departure morning: one last swim, visit the lighthouse, travel onward.'
    ],
    family: [
      'Arrive and explore the local area, fun beach time, and an early dinner.',
      'Safari in one of Sri Lanka\'s national parks – spot elephants, leopards, and deer.',
      'Visit an elephant sanctuary for an ethical feeding and bathing experience.',
      'Explore a botanical garden, spot giant flying foxes, and have a picnic.',
      'Easy nature walk and bird-watching session suitable for all ages.',
      'Visit a spice garden, try hands-on spice-grinding, and shop for souvenirs.',
      'Train ride through the hill country – one of the world\'s most scenic rail journeys.',
      'Visit a local school and a small craft workshop to meet community artisans.',
      'Water park or beach fun day, ice cream by the ocean, easy evening stroll.',
      'Final morning market visit to buy local treats, then head to the airport.'
    ]
  };

  var typeActivities = activities[tripType] || activities['cultural'];
  var itinerary = [];

  // Distribute locations across days
  for (var i = 0; i < numDays; i++) {
    var loc = locations[i % locations.length];
    var actTemplate = typeActivities[i % typeActivities.length];

    // Budget-specific notes
    var budgetNote = '';
    if (budget === 'budget')   budgetNote = ' Stay at a well-rated guesthouse.';
    if (budget === 'moderate') budgetNote = ' Comfortable mid-range hotel recommended.';
    if (budget === 'luxury')   budgetNote = ' Luxury boutique resort with spa facilities.';

    itinerary.push({
      day:      i + 1,
      location: loc,
      activity: actTemplate + budgetNote
    });
  }

  return itinerary;
}

function showPlannerError(msg) {
  var el = document.getElementById('planner-error');
  if (el) {
    el.textContent = msg;
    el.classList.add('visible');
  }
}
function clearPlannerError() {
  var el = document.getElementById('planner-error');
  if (el) el.classList.remove('visible');
}


/* =============================================================
   8. CONTACT FORM VALIDATION (contact.html)
   Client-side validation before PHP form submission.
   ============================================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Real-time validation on blur
  const fields = form.querySelectorAll('.form-control');
  fields.forEach(function (field) {
    field.addEventListener('blur', function () {
      validateField(field);
    });
    field.addEventListener('input', function () {
      if (field.classList.contains('error')) validateField(field);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate all fields
    var isValid = true;
    fields.forEach(function (field) {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      showFormAlert('error', 'Please correct the highlighted errors before submitting.');
      return;
    }

    // Simulate submission (actual submission handled by PHP via AJAX or native submit)
    submitContactForm(form);
  });
}

/**
 * Validates a single form field.
 * Returns true if valid, false if invalid.
 */
function validateField(field) {
  const fieldId   = field.id;
  const value     = field.value.trim();
  const errorEl   = document.getElementById(fieldId + '-error');

  // Clear previous state
  field.classList.remove('error', 'success');
  if (errorEl) errorEl.classList.remove('visible');

  var msg = '';

  // Required check
  if (field.required && value === '') {
    msg = 'This field is required.';
  }
  // Name: minimum 2 characters
  else if (fieldId === 'name' && value.length > 0 && value.length < 2) {
    msg = 'Please enter your full name (at least 2 characters).';
  }
  // Email format
  else if (fieldId === 'email' && value !== '') {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      msg = 'Please enter a valid email address.';
    }
  }
  // Message minimum length
  else if (fieldId === 'message' && value.length > 0 && value.length < 20) {
    msg = 'Message must be at least 20 characters long.';
  }

  if (msg) {
    field.classList.add('error');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.add('visible');
    }
    return false;
  } else if (value !== '') {
    field.classList.add('success');
    return true;
  }

  return field.required ? false : true;
}

/**
 * Submits the form via fetch() to PHP backend.
 * Shows success or error message based on response.
 */
function submitContactForm(form) {
  const submitBtn = form.querySelector('[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
  }

  var formData = new FormData(form);

  fetch('php/contact.php', {
    method: 'POST',
    body: formData
  })
  .then(function (response) { return response.json(); })
  .then(function (data) {
    if (data.success) {
      showFormAlert('success',
        'Thank you, ' + data.name + '! Your message has been received. ' +
        'We will respond to ' + data.email + ' within 24 hours.');
      form.reset();
      form.querySelectorAll('.form-control').forEach(function (f) {
        f.classList.remove('error', 'success');
      });
    } else {
      showFormAlert('error', data.message || 'Something went wrong. Please try again.');
    }
  })
  .catch(function () {
    // Fallback for when PHP is not available (e.g., static demo)
    showFormAlert('success',
      'Thank you for your message! (Demo mode: PHP not running.) We will be in touch soon.');
    form.reset();
  })
  .finally(function () {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

function showFormAlert(type, msg) {
  var alertEl = document.getElementById('form-alert');
  if (!alertEl) return;

  alertEl.className = 'alert alert--' + type + ' visible';
  alertEl.querySelector('p').textContent = msg;
  alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
