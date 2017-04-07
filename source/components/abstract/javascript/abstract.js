"use strict";
(function () {

    /**
     * Sigleton container
     */
    let instance;

    /**
     * @class Abstract represent contros for Scene class
     * @throws abstractSelect custom event that define target rotation
     */
    class Abstract {

        /**
         * @constructor define inner variables, method bindings and start init method on DOM load
         */
        constructor () {

            if(typeof instance !== "undefined") return instance;
            instance = this;

            this.blocked = false;
            this.animation_duration = 500;

            for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
                const method = this[name];
                if (name !== 'constructor' && typeof method === 'function') {
                    this[name] = method.bind(this);
                }
            }

            let ready = new Promise((resolve, reject) => {
            if (document.readyState != "loading") return resolve();
                document.addEventListener("DOMContentLoaded", () => resolve());
            });
            ready.then(this.init.bind(this));
        }

        /**
         * Preselect elements and add event listeners
         */
        init () {
            this.component = document.querySelector('.abstract');
            this.chapter = this.component.querySelector('.abstract__chapter--current');
            for(let chapter of this.component.querySelectorAll('.abstract__chapter')) {
                chapter.addEventListener('click', this.open);
            }
        }

        /**
         * Mark selected option as current and dispatch event for Scene class
         * @param {Event} event mouse click or touch event
         */
        open (event) {
            if (this.isBlocked()) return;

            const chapter = event.currentTarget
                , target = chapter.getAttribute('data-target');
            
            if (chapter.classList.contains('abstract__chapter--current')) return;

            this.chapter.classList.remove('abstract__chapter--current');
            this.chapter = chapter;
            chapter.classList.add('abstract__chapter--current');

            document.dispatchEvent(new CustomEvent('abstractSelect', { 'detail': target }));
            
            this.block();
            setTimeout(this.unblock, this.animation_duration);
        }

        /**
         * Block the controls, while animation playing
         */
        block () {
            this.blocked = true;
        }

        /**
         * Unblock the controls
         */
        unblock () {
            this.blocked = false;
        }

        /**
         * Check if controls is blocked
         */
        isBlocked () {
            return this.blocked;
        }
    }
    new Abstract;

})();