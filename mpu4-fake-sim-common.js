/**
 * Shared training UI: blocking modal so learners notice each simulated event.
 * @global Mpu4Sim
 */
(function () {
    var OVERLAY_ID = 'mpu4-sim-notice-overlay';

    function lockScroll(on) {
        document.body.style.overflow = on ? 'hidden' : '';
    }

    function removeExisting() {
        var el = document.getElementById(OVERLAY_ID);
        if (el) el.remove();
    }

    function escapeHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function normalizeFollowUp(followUp) {
        if (!followUp) return [];
        if (Array.isArray(followUp)) return followUp.map(String).filter(function (x) { return x.trim(); });
        var t = String(followUp).trim();
        return t ? [t] : [];
    }

    function defaultFollowUp() {
        return [
            'Write down the exact URL in your address bar and compare it to the official site from a new search tab.',
            'Explain to a partner in one sentence what would have gone wrong if this had been a real attack.'
        ];
    }

    function buildFollowUpHtml(followUp) {
        var list = normalizeFollowUp(followUp);
        if (!list.length) return '';
        return (
            '<div class="sim-notice-follow">' +
            '<p class="sim-notice-follow-title">What to do next (to lock in the concept)</p>' +
            '<ol class="sim-notice-follow-list">' +
            list.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') +
            '</ol></div>'
        );
    }

    /**
     * @param {string} message - What was simulated (flag summary).
     * @param {{ title?: string, foot?: string, explanation?: string, followUp?: string|string[] }=} opts
     */
    function showTrainingNotice(message, opts) {
        opts = opts || {};
        removeExisting();
        var title = opts.title || 'Training simulation alert';
        var foot = opts.foot != null ? opts.foot : 'Nothing harmful ran on your device. This page is for cybersecurity education only.';
        var explain = opts.explanation != null ? opts.explanation : '';
        var explainBlock = explain
            ? '<p class="sim-notice-why"><strong>Why it matters:</strong> ' + escapeHtml(explain) + '</p>'
            : '';
        var followMerged = normalizeFollowUp(opts.followUp);
        if (!followMerged.length) followMerged = defaultFollowUp();
        var followBlock = buildFollowUpHtml(followMerged);

        var root = document.createElement('div');
        root.id = OVERLAY_ID;
        root.className = 'sim-notice-overlay';
        root.setAttribute('role', 'alertdialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-labelledby', 'mpu4-sim-notice-title');

        root.innerHTML =
            '<div class="sim-notice-dialog">' +
            '<div class="sim-notice-bar"></div>' +
            '<div class="sim-notice-inner">' +
            '<div class="sim-notice-icon"><i class="fas fa-shield-halved" aria-hidden="true"></i></div>' +
            '<h2 id="mpu4-sim-notice-title">' + escapeHtml(title) + '</h2>' +
            '<p class="sim-notice-body">' + escapeHtml(message) + '</p>' +
            explainBlock +
            followBlock +
            '</div>' +
            '<p class="sim-notice-foot">' + escapeHtml(foot) + '</p>' +
            '<div class="sim-notice-actions">' +
            '<button type="button" class="btn btn-primary" id="mpu4-sim-notice-ok">I understand</button>' +
            '</div></div>';

        document.body.appendChild(root);
        lockScroll(true);

        function close() {
            lockScroll(false);
            removeExisting();
        }

        root.querySelector('#mpu4-sim-notice-ok').addEventListener('click', close);

        root.addEventListener('click', function (e) {
            if (e.target === root) {
                root.classList.add('sim-notice-shake');
                setTimeout(function () { root.classList.remove('sim-notice-shake'); }, 400);
            }
        });

        var dialog = root.querySelector('.sim-notice-dialog');
        if (dialog) {
            dialog.addEventListener('click', function (e) { e.stopPropagation(); });
        }

        setTimeout(function () {
            var btn = document.getElementById('mpu4-sim-notice-ok');
            if (btn) btn.focus();
        }, 50);
    }

    /**
     * @param {string} summary - What the learner just triggered.
     * @param {string} explanation - Brief why this is dangerous in the real world.
     * @param {string[]=} followUp - Concrete class/lab follow-ups (defaults if omitted).
     */
    function logSimEvent(summary, explanation, followUp) {
        if (!explanation || !String(explanation).trim()) {
            explanation = 'In real incidents, small mistakes like this one are chained together until accounts or devices are compromised.';
        }
        var fu = normalizeFollowUp(followUp);
        if (!fu.length) fu = defaultFollowUp();
        showTrainingNotice(summary, {
            title: 'Training simulation alert',
            foot: 'No malware executed. This is a safe classroom exercise.',
            explanation: explanation,
            followUp: fu
        });
    }

    window.Mpu4Sim = {
        showTrainingNotice: showTrainingNotice,
        logSimEvent: logSimEvent,
        normalizeFollowUp: normalizeFollowUp
    };
})();
