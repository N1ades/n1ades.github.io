import path from "path";
import fs from "fs";
import { JSDOM } from "jsdom"

const processHtml = (dom: JSDOM, components) => {

    for (const component of components) {

        const instances = dom.window.document.querySelectorAll(component.name);
        if (!instances.length) {
            continue
        }

        let templateDom = new JSDOM(fs.readFileSync(component.path, 'utf-8'))
        let templateRaw = templateDom.window.document.querySelector('template').innerHTML


        dom.window.document.head.appendChild(templateDom.window.document.querySelector('style'))

        for (const instance of instances) {
            const instanceTemplates = Array.from(instance.querySelectorAll('template'))
            const template = processHtml(new JSDOM(templateRaw), components)

            for (const slot of template.window.document.querySelectorAll('slot')) {
                const name = slot.getAttributeNames().find(attr => attr === 'name');

                const slotName = slot.getAttribute(name);

                const templateContent = instanceTemplates.find(element => {
                    return element.getAttributeNames().filter(name => name.startsWith('#')).map(n => n.slice(1)).includes(slotName)
                })?.innerHTML;

                slot.outerHTML = templateContent;
            }
            instance.outerHTML = template.serialize()
        }
    }
    return dom;

}

export const htmlComponentsPlugin = () => {
    return {
        name: "html-components-plugin",
        transformIndexHtml(html, { filename }) {
            const componentsDir = path.resolve(path.dirname(filename), 'components')
            const components = fs.readdirSync(componentsDir).map((filename) => ({
                filename: path.basename(filename),
                path: path.resolve(componentsDir, path.basename(filename)),
                name: path.basename(filename).split('.').shift()
            }))

            return processHtml(new JSDOM(html), components).serialize();
        },
    };
}