const slides = document.querySelectorAll('.review-slide');
const dots = document.querySelectorAll('.dot');

if (slides.length && dots.length) {
	let current = 0;

	const showSlide = (index) => {
		slides.forEach((slide, i) => {
			slide.classList.toggle('active', i === index);
		});

		dots.forEach((dot, i) => {
			dot.classList.toggle('active', i === index);
		});

		current = index;
	};

	dots.forEach((dot, index) => {
		dot.addEventListener('click', () => showSlide(index));
	});

	setInterval(() => {
		const next = (current + 1) % slides.length;
		showSlide(next);
	}, 4500);
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
