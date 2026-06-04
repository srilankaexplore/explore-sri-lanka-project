/**
 * Explore Sri Lanka – jQuery Effects
 * File:    js/jquery-effects.js
 * Author:  Web Design Assignment
 * Purpose: Accordion, tab switching, AJAX destination loader,
 *          hover effects, smooth scroll, and animated counter.
 * Requires: jQuery 3.7.x
 */

/* =============================================================
   Wait for DOM ready using jQuery shorthand
   ============================================================= */
$(function () {
  initAccordion();
  initTabs();
  initFaqAccordion();
  initAjaxDestinations();
  initHoverEffects();
  initSmoothScroll();
  initAnimatedCounters();
  initNavbarScroll();
});


/* =============================================================
   1. ACCORDION (Culture & Food page – mobile layout)
   Only one panel open at a time (exclusive open behaviour).
   ============================================================= */
function initAccordion() {
  var $headers = $('.accordion-header');
  if (!$headers.length) return;

  $headers.on('click', function () {
    var $this   = $(this);
    var $body   = $this.next('.accordion-body');
    var isOpen  = $this.hasClass('active');

    // Close all panels first
    $headers.each(function () {
      $(this).removeClass('active').attr('aria-expanded', 'false');
      $(this).next('.accordion-body').stop(true, true).slideUp(280).removeClass('open');
    });

    // Open this one if it was closed
    if (!isOpen) {
      $this.addClass('active').attr('aria-expanded', 'true');
      $body.stop(true, true).slideDown(300).addClass('open');
    }
  });

  // Open first accordion item by default
  $headers.first().trigger('click');
}


/* =============================================================
   2. TABS (Culture & Food page – desktop layout)
   Switches visible content panel matching data-tab attribute.
   ============================================================= */
function initTabs() {
  var $tabBtns   = $('.tab-btn');
  var $tabPanels = $('.tab-panel');
  if (!$tabBtns.length) return;

  $tabBtns.on('click', function () {
    var target = $(this).data('tab');

    // Update buttons
    $tabBtns.removeClass('active').attr('aria-selected', 'false');
    $(this).addClass('active').attr('aria-selected', 'true');

    // Switch panels with a subtle fade
    $tabPanels.hide().removeClass('active');
    $('#' + target).fadeIn(300).addClass('active');
  });

  // Activate first tab on load
  $tabBtns.first().trigger('click');
}


/* =============================================================
   3. FAQ ACCORDION (Contact page)
   Simple show/hide with animated arrow rotation.
   ============================================================= */
function initFaqAccordion() {
  var $faqHeaders = $('.faq-header');
  if (!$faqHeaders.length) return;

  $faqHeaders.on('click', function () {
    var $this  = $(this);
    var $body  = $this.next('.faq-body');
    var isOpen = $this.hasClass('active');

    // Close all
    $faqHeaders.removeClass('active');
    $('.faq-body').stop(true, true).slideUp(240);

    // Toggle this
    if (!isOpen) {
      $this.addClass('active');
      $body.stop(true, true).slideDown(280);
    }
  });
}


/* =============================================================
   4. AJAX – Load destinations from JSON (Travel Planner page)
   Fetches data/destinations.json and populates the checkbox
   group in the trip planner form without a page reload.
   ============================================================= */
function initAjaxDestinations() {
  var $container = $('#ajax-destinations');
  if (!$container.length) return;

  // Show loading spinner
  $container.html(
    '<div class="loading-spinner">' +
    '  <div class="spinner"></div>' +
    '  <span>Loading destinations…</span>' +
    '</div>'
  );

  $.ajax({
    url:      'data/destinations.json',
    method:   'GET',
    dataType: 'json',
    success: function (data) {
      renderDestinationCheckboxes(data, $container);
    },
    error: function (xhr, status, error) {
      // Graceful fallback – show a static list if JSON file cannot be loaded
      var fallback = [
        { id: 'colombo',      name: 'Colombo',      category: 'city' },
        { id: 'kandy',        name: 'Kandy',         category: 'heritage' },
        { id: 'galle',        name: 'Galle',         category: 'heritage' },
        { id: 'ella',         name: 'Ella',          category: 'nature' },
        { id: 'sigiriya',     name: 'Sigiriya',      category: 'heritage' },
        { id: 'nuwara-eliya', name: 'Nuwara Eliya',  category: 'nature' },
        { id: 'anuradhapura', name: 'Anuradhapura',  category: 'heritage' },
        { id: 'mirissa',      name: 'Mirissa',       category: 'beach' }
      ];
      renderDestinationCheckboxes(fallback, $container);
      console.warn('AJAX: Could not load destinations.json – using fallback data.', error);
    }
  });
}

/**
 * Renders destination checkboxes into the container element.
 * @param {Array}   destinations  Array of destination objects
 * @param {jQuery}  $container    Target jQuery element
 */
function renderDestinationCheckboxes(destinations, $container) {
  var html = '<div class="checkbox-group">';

  $.each(destinations, function (i, dest) {
    var category = dest.category.charAt(0).toUpperCase() + dest.category.slice(1);
    html +=
      '<label>' +
      '  <input type="checkbox" name="locations" value="' + escapeHtml(dest.name) + '">' +
      '  ' + escapeHtml(dest.name) +
      '  <small style="color:var(--clr-text-light);margin-left:2px;">(' + escapeHtml(category) + ')</small>' +
      '</label>';
  });

  html += '</div>';
  $container.html(html);

  // Animate in
  $container.hide().fadeIn(400);
}

/** Simple HTML escaping for injected content */
function escapeHtml(str) {
  return $('<div>').text(str).html();
}


/* =============================================================
   5. HOVER EFFECTS
   jQuery-powered card lift + badge colour shift.
   CSS transitions handle the actual animation; jQuery just
   adds/removes a modifier class for more complex states.
   ============================================================= */
function initHoverEffects() {
  // Button ripple effect on click
  $(document).on('click', '.btn', function (e) {
    var $btn = $(this);
    $btn.addClass('btn--clicked');
    setTimeout(function () {
      $btn.removeClass('btn--clicked');
    }, 300);
  });

  // Card: show overlay on hover (for future image overlay)
  $(document).on('mouseenter', '.card', function () {
    $(this).find('.card-img-overlay').stop(true).fadeIn(200);
  }).on('mouseleave', '.card', function () {
    $(this).find('.card-img-overlay').stop(true).fadeOut(200);
  });

  // Filter bar button: animate count label
  $('.filter-btn').on('click', function () {
    var $btn   = $(this);
    var filter = $btn.data('filter');
    var count  = filter === 'all'
      ? $('.dest-card').length
      : $('.dest-card[data-category="' + filter + '"]').length;

    // Brief bounce animation
    $btn.css('transform', 'scale(1.1)');
    setTimeout(function () {
      $btn.css('transform', '');
    }, 200);

    // Update count display if it exists
    var $countEl = $('#filter-count');
    if ($countEl.length) {
      $countEl.fadeOut(150, function () {
        $(this).text(count + (count === 1 ? ' destination' : ' destinations')).fadeIn(150);
      });
    }
  });
}


/* =============================================================
   6. SMOOTH SCROLL (enhanced jQuery version)
   Handles anchor links beginning with # for smooth scrolling
   with an offset to account for the sticky header.
   ============================================================= */
function initSmoothScroll() {
  $(document).on('click', 'a[href^="#"]', function (e) {
    var target = $(this).attr('href');
    if (target === '#') return;

    var $target = $(target);
    if (!$target.length) return;

    e.preventDefault();

    var headerHeight = $('.site-header').outerHeight(true) || 70;
    var offset       = $target.offset().top - headerHeight - 16;

    $('html, body').stop().animate({ scrollTop: offset }, 600, 'swing');
  });
}


/* =============================================================
   7. ANIMATED COUNTERS (Home page stat section)
   Animates numbers from 0 to target value when they scroll
   into the viewport. Uses requestAnimationFrame via jQuery.
   ============================================================= */
function initAnimatedCounters() {
  var $stats = $('.stat-num');
  if (!$stats.length) return;

  var animated = false;

  function animateCounters() {
    if (animated) return;

    var $statsSection = $('.stat-row');
    if (!$statsSection.length) return;

    var sectionTop = $statsSection.offset().top;
    var scrollPos  = $(window).scrollTop() + $(window).height();

    if (scrollPos >= sectionTop) {
      animated = true;

      $stats.each(function () {
        var $el   = $(this);
        var target = parseInt($el.text().replace(/\D/g, ''), 10) || 0;
        var suffix = $el.text().replace(/[0-9]/g, '');

        $({ count: 0 }).animate({ count: target }, {
          duration: 1500,
          easing: 'swing',
          step: function () {
            $el.text(Math.floor(this.count) + suffix);
          },
          complete: function () {
            $el.text(target + suffix);
          }
        });
      });
    }
  }

  $(window).on('scroll', animateCounters);
  animateCounters(); // run once in case already visible
}


/* =============================================================
   8. NAVBAR SCROLL BEHAVIOUR
   Adds a drop-shadow class to the sticky header after scrolling
   past the hero to give a clear visual elevation distinction.
   ============================================================= */
function initNavbarScroll() {
  var $header = $('.site-header');
  if (!$header.length) return;

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 80) {
      $header.addClass('scrolled');
    } else {
      $header.removeClass('scrolled');
    }
  }).trigger('scroll');
}
