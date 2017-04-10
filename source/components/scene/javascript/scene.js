"use strict";
(function () {

    /**
     * Sigleton container
     */
    let instance;


    /**
     * @class Scene represent motorcycle rotation, controled with the events from Abstract class
     */
    class Scene {

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
            this.scene = document.querySelector('.scene');

            if (this.scene == null) return;

            this.current = this.scene.getAttribute('data-current');
            document.addEventListener('abstractSelect', this.play);
        }

        /**
         * Rotate scene to the defined state
         * @param {Event} event Custom event emitted by Abstract class and containig information about target state of the scene
         */
        play (event) {
            event.preventDefault();
            if (this.isBlocked()) return;

            const target = event.detail;

            if (this.current === target) return;

            this.scene.classList = "scene  scene--from-" + this.current + "-to-" + target;
            this.current = target;
            this.scene.setAttribute('data-current', target);

            this.block();
            setTimeout(this.unblock, this.animation_duration);
        }

        /**
         * Block the scene, while animation playing
         */
        block () {
            this.blocked = true;
        }

        /**
         * Unblock the scene
         */
        unblock () {
            this.blocked = false;
        }

        /**
         * Check if scene is blocked
         */
        isBlocked () {
            return this.blocked;
        }
    }

    new Scene;
})();