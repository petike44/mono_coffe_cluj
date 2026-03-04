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
