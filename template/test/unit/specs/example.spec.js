import Vue from 'vue/dist/vue.common.js'
import devComponent from '../../../src/index.vue'

describe('index.vue', () => {
    it('should render correct DOM', () => {
        const vm = new Vue({
            el: document.createElement('div'),
            components: {
            	'dev-component': devComponent
            },
            template:`
            	<section>
                    <div class="component-container">
                        <dev-component></dev-component>
                    </div>
                </section>
        	`
        });
    expect(vm.$el.querySelector('.component-container').querySelectorAll('.example').length)
      .to.equal(1)
    })
})
