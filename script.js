
const reviewTrack = document.querySelector('.review-track');

if (reviewTrack) {
	const realSlides = Array.from(reviewTrack.querySelectorAll('.review-slide'));
	const total = realSlides.length;
	const reviewWrap = reviewTrack.closest('.review-slider-wrap');
	const reviewViewport = reviewTrack.parentElement;

	// Build infinite loop: [clone 0..9] [real 0..9] [clone 0..9]
	realSlides.slice().reverse().forEach(s => reviewTrack.prepend(s.cloneNode(true)));
	realSlides.forEach(s => reviewTrack.appendChild(s.cloneNode(true)));

	let index = total; // start at first real slide
	let moving = false;
	let touchStartX = 0;
	let touchEndX = 0;

	const dots = [];

	const getLogicalIndex = () => ((index - total) % total + total) % total;

	const updateDots = () => {
		const active = getLogicalIndex();
		dots.forEach((dot, i) => {
			dot.classList.toggle('is-active', i === active);
			dot.setAttribute('aria-selected', i === active ? 'true' : 'false');
		});
	};

	const getVisible = () => (window.innerWidth <= 980 ? 1 : 3);

	const getGap = () => {
		const gapValue = getComputedStyle(reviewTrack).getPropertyValue('--review-gap').trim();
		const parsed = parseFloat(gapValue);
		return Number.isNaN(parsed) ? 20 : parsed;
	};

	const getSlideWidth = () => {
		const vis = getVisible();
		const gap = getGap();
		const containerWidth = reviewTrack.parentElement.offsetWidth;
		return (containerWidth - gap * (vis - 1)) / vis;
	};

	const applyWidths = () => {
		const w = getSlideWidth();
		reviewTrack.querySelectorAll('.review-slide').forEach(s => { s.style.width = w + 'px'; });
	};

	const moveTo = (i, animate = true) => {
		const gap = getGap();
		reviewTrack.style.transition = animate
			? 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)'
			: 'none';
		reviewTrack.style.transform = `translateX(-${i * (getSlideWidth() + gap)}px)`;
	};

	applyWidths();
	moveTo(index, false);

	if (reviewWrap && total > 1) {
		const dotsContainer = document.createElement('div');
		dotsContainer.className = 'review-mobile-dots';
		dotsContainer.setAttribute('role', 'tablist');
		dotsContainer.setAttribute('aria-label', 'Navigare recenzii');

		realSlides.forEach((_, i) => {
			const dot = document.createElement('button');
			dot.type = 'button';
			dot.className = 'review-mobile-dot';
			dot.setAttribute('role', 'tab');
			dot.setAttribute('aria-label', `Recenzia ${i + 1}`);
			dot.setAttribute('aria-selected', 'false');
			dot.addEventListener('click', () => {
				goTo(total + i);
				resetTimer();
			});
			dots.push(dot);
			dotsContainer.appendChild(dot);
		});

		reviewWrap.appendChild(dotsContainer);
		updateDots();
	}

	const goTo = (i) => {
		if (moving) return;
		moving = true;
		index = i;
		moveTo(index);

		const onEnd = () => {
			reviewTrack.removeEventListener('transitionend', onEnd);
			if (index >= total * 2) {
				index -= total;
				moveTo(index, false);
			} else if (index < total) {
				index += total;
				moveTo(index, false);
			}
			updateDots();
			moving = false;
		};
		reviewTrack.addEventListener('transitionend', onEnd);
	};

	let autoTimer = setInterval(() => goTo(index + 1), 5000);

	const resetTimer = () => {
		clearInterval(autoTimer);
		autoTimer = setInterval(() => goTo(index + 1), 5000);
	};

	document.querySelector('#review-prev')?.addEventListener('click', () => { goTo(index - 1); resetTimer(); });
	document.querySelector('#review-next')?.addEventListener('click', () => { goTo(index + 1); resetTimer(); });

	if (reviewViewport) {
		reviewViewport.addEventListener('touchstart', (event) => {
			touchStartX = event.changedTouches[0].clientX;
		});

		reviewViewport.addEventListener('touchend', (event) => {
			touchEndX = event.changedTouches[0].clientX;
			const delta = touchEndX - touchStartX;

			if (Math.abs(delta) < 40) return;
			if (delta < 0) {
				goTo(index + 1);
			} else {
				goTo(index - 1);
			}
			resetTimer();
		});
	}

	window.addEventListener('resize', () => {
		applyWidths();
		moveTo(index, false);
		updateDots();
	});
}




const heroStatus = document.querySelector('#hero-status');
const heroStatusTitle = document.querySelector('#hero-status-title');
const heroStatusSub = document.querySelector('#hero-status-sub');

if (heroStatus && heroStatusTitle && heroStatusSub) {
	const dayNames = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];

	const getProgramForDay = (dayOfWeek) => {
		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			return { openMinute: 7 * 60 + 30, closeMinute: 19 * 60, openLabel: '07:30' };
		}

		return { openMinute: 9 * 60, closeMinute: 17 * 60, openLabel: '09:00' };
	};

	const getNextOpeningInfo = (now) => {
		const todayDay = now.getDay();
		const currentMinute = now.getHours() * 60 + now.getMinutes();

		for (let offset = 0; offset < 8; offset += 1) {
			const candidateDay = (todayDay + offset) % 7;
			const program = getProgramForDay(candidateDay);

			if (offset === 0 && currentMinute >= program.openMinute) {
				continue;
			}

			if (offset === 0) {
				return { label: 'azi', openLabel: program.openLabel };
			}

			if (offset === 1) {
				return { label: 'mâine', openLabel: program.openLabel };
			}

			return { label: dayNames[candidateDay], openLabel: program.openLabel };
		}

		return { label: 'mâine', openLabel: '07:30' };
	};

	const updateHeroStatus = () => {
		const now = new Date();
		const currentMinute = now.getHours() * 60 + now.getMinutes();
		const todayProgram = getProgramForDay(now.getDay());
		const isOpenNow = currentMinute >= todayProgram.openMinute && currentMinute < todayProgram.closeMinute;

		heroStatus.classList.remove('hero-status-open', 'hero-status-warning', 'hero-status-closed');

		if (isOpenNow) {
			const minutesToClose = todayProgram.closeMinute - currentMinute;

			if (minutesToClose <= 30) {
				heroStatus.classList.add('hero-status-warning');
				heroStatusTitle.textContent = 'Închidem curând';
				heroStatusSub.textContent = `Programul de azi se termină în ${minutesToClose} min.`;
				return;
			}

			heroStatus.classList.add('hero-status-open');
			heroStatusTitle.textContent = 'Deschis acum';
			heroStatusSub.textContent = 'Comenzile se preiau în acest moment.';
			return;
		}

		heroStatus.classList.add('hero-status-closed');
		heroStatusTitle.textContent = 'Închis';
		const nextOpening = getNextOpeningInfo(now);
		heroStatusSub.textContent = `Programul de ${nextOpening.label} începe la ${nextOpening.openLabel}.`;
	};

	updateHeroStatus();
	setInterval(updateHeroStatus, 60 * 1000);
}

const aboutSlider = document.querySelector('.about-photo-slider');

if (aboutSlider) {
	const maxSlides = 3;
	let currentSlide = 1;
	let activeImageIndex = 0;
	const aboutSlideImages = Array.from(aboutSlider.querySelectorAll('.about-slide-image'));

	const preloadImages = () => {
		for (let i = 1; i <= maxSlides; i += 1) {
			const img = new Image();
			img.src = `photos/slideshow/photo_${i}.webp`;
		}
	};

	if (aboutSlideImages.length >= 2) {
		aboutSlideImages[0].classList.add('is-active');

		const showNextSlide = () => {
			currentSlide = currentSlide >= maxSlides ? 1 : currentSlide + 1;

			const activeImage = aboutSlideImages[activeImageIndex];
			const nextImageIndex = activeImageIndex === 0 ? 1 : 0;
			const nextImage = aboutSlideImages[nextImageIndex];

			nextImage.src = `photos/slideshow/photo_${currentSlide}.webp`;
			nextImage.alt = `Cadru Mono Coffee ${currentSlide}`;

			requestAnimationFrame(() => {
				nextImage.classList.add('is-active');
				activeImage.classList.remove('is-active');
			});

			activeImageIndex = nextImageIndex;
		};

		preloadImages();
		setInterval(showNextSlide, 5600);
	}
}

const aboutProcess = document.querySelector('.about-showcase-process');

if (aboutProcess) {
	const processSteps = Array.from(aboutProcess.querySelectorAll('.about-process-step'));

	if (processSteps.length) {
		let currentStep = 0;
		let autoplay;

		const setStep = (index) => {
			const safeIndex = ((index % processSteps.length) + processSteps.length) % processSteps.length;

			processSteps.forEach((step, i) => {
				step.classList.toggle('is-active', i === safeIndex);
			});

			currentStep = safeIndex;
		};

		const restartAutoplay = () => {
			clearInterval(autoplay);
			autoplay = setInterval(() => {
				setStep(currentStep + 1);
			}, 5200);
		};

		processSteps.forEach((step, index) => {
			step.addEventListener('click', () => {
				setStep(index);
				restartAutoplay();
			});
		});

		aboutProcess.addEventListener('mouseenter', () => {
			clearInterval(autoplay);
		});

		aboutProcess.addEventListener('mouseleave', () => {
			restartAutoplay();
		});

		setStep(0);
		restartAutoplay();
	}
}
