// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
import 'viewerjs/dist/viewer.min.css';
import imageViewer from 'vitepress-plugin-image-viewer';
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue';
import { useData, useRoute } from 'vitepress';

export default {
    ...DefaultTheme,
    enhanceApp(ctx) {
        DefaultTheme.enhanceApp(ctx);
        ctx.app.component('vImageViewer', vImageViewer);
    },
    setup() {
        // Get frontmatter and route
        const { frontmatter } = useData();
        const route = useRoute();
        
        // Obtain configuration from: https://giscus.app/
        giscusTalk({
            repo: 'Candinya/full-stack-in-7-days',
            repoId: 'R_kgDOLUGQVA',
            category: '读者说',
            categoryId: 'DIC_kwDOLUGQVM4CdTt3',
            mapping: 'pathname',
            reactionsEnabled: "1",
            inputPosition: 'top',
            lang: 'zh-CN',
            lightTheme: 'light',
            darkTheme: 'transparent_dark',
            loading: 'lazy',
        }, {
            frontmatter, route
        },
            // Whether to activate the comment area on all pages.
            // The default is true, which means enabled, this parameter can be ignored;
            // If it is false, it means it is not enabled.
            // You can use `comment: true` preface to enable it separately on the page.
            true
        );

        imageViewer(route);
    }
};