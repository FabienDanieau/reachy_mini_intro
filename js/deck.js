// SLIDE CONTROLLER: keys, wheel, swipe, stage scaling, #N deep links
class SlidePresentation {
    constructor() {
        this.slides = [...document.querySelectorAll('.slide')];
        this.stage = document.getElementById('deckStage');
        this.current = 0;
        this.lock = 0;
        this.scaleStage();
        addEventListener('resize', () => this.scaleStage());
        addEventListener('keydown', e => {
            if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); this.next(1); }
            if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); this.next(-1); }
        });
        addEventListener('wheel', e => {
            if (Date.now() < this.lock || Math.abs(e.deltaY) < 20) return;
            this.lock = Date.now() + 900;
            this.next(Math.sign(e.deltaY));
        }, { passive: true });
        let x0 = null;
        addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
        addEventListener('touchend', e => {
            if (x0 === null) return;
            const dx = e.changedTouches[0].clientX - x0;
            if (Math.abs(dx) > 50) this.next(-Math.sign(dx));
            x0 = null;
        });
        const [slide, step] = location.hash.slice(1).split('.').map(Number); // #3.2 = slide 3, focus step 2
        this.go((slide || 1) - 1);
        if (step) { this.step = Math.min(step, this.steps(this.current)); this.emit(); }
    }
    scaleStage() {
        const f = Math.min(innerWidth / 1920, innerHeight / 1080);
        this.stage.style.transform = `translate(${(innerWidth - 1920 * f) / 2}px, ${(innerHeight - 1080 * f) / 2}px) scale(${f})`;
    }
    // A slide with data-steps="N" takes N extra presses before the next slide (camera focus steps).
    steps(i) { return +(this.slides[i]?.dataset.steps ?? 0); }
    next(dir) {
        const step = this.step + dir;
        if (step >= 0 && step <= this.steps(this.current)) { this.step = step; this.emit(); }
        else if (this.slides[this.current + dir]) this.go(this.current + dir, dir < 0);
    }
    go(i, atEnd = false) {
        this.current = Math.max(0, Math.min(i, this.slides.length - 1));
        this.step = atEnd ? this.steps(this.current) : 0;
        this.slides.forEach((s, j) => { s.classList.toggle('active', j === this.current); s.classList.toggle('visible', j === this.current); });
        this.stage.dataset.slide = this.slides[this.current].dataset.id;
        document.getElementById('progress').style.width = `${((this.current + 1) / this.slides.length) * 100}%`;
        this.emit();
    }
    emit() {
        this.stage.dataset.step = this.step;
        // Step-dependent elements: [data-only="0 2"] at those steps, [data-from="1"] from that step on.
        const slide = this.slides[this.current];
        for (const el of slide.querySelectorAll('[data-only]')) el.classList.toggle('on', el.dataset.only.split(' ').map(Number).includes(this.step));
        for (const el of slide.querySelectorAll('[data-from]')) el.classList.toggle('on', this.step >= +el.dataset.from);
        history.replaceState(null, '', `#${this.current + 1}${this.step ? '.' + this.step : ''}`);
        dispatchEvent(new CustomEvent('slidechange', { detail: { slide: this.current, id: slide.dataset.id, step: this.step } }));
    }
}
// Page numbers in each slide's footer
document.querySelectorAll('.slide').forEach((s, i) => s.querySelectorAll('.chrome .num').forEach(n => { n.textContent = String(i + 1).padStart(2, '0'); }));
window.deck = new SlidePresentation();
