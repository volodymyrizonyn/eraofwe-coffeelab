import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CoffeeLabComponent } from './coffee-lab.component';
import { OverviewComponent } from './google-view/overview/overview.component';
import { CoffeeRecipesViewComponent } from './google-view/coffee-recipes/coffee-recipes-view/coffee-recipes-view.component';
import { RecipeDetailComponent } from './google-view/coffee-recipes/recipe-detail/recipe-detail.component';
import { QaForumViewComponent } from './google-view/qa-forum/qa-forum-view/qa-forum-view.component';
import { QuestionDetailComponent } from './google-view/qa-forum/question-detail/question-detail.component';
import { ArticlesViewComponent } from './google-view/articles/articles-view/articles-view.component';
import { ArticleDetailComponent } from './google-view/articles/article-detail/article-detail.component';
import { EraOfWeComponent } from './google-view/era-of-we/era-of-we.component';

const userLang = navigator.language;
const lang = userLang === 'sv' || userLang === 'sv-sv' ? 'sv' : 'en';

const routes: Routes = [
    {
        path: '',
        component: CoffeeLabComponent,
        children: [
            {
                path: '',
                redirectTo: `${lang}/overview`,
                pathMatch: 'full',
            },
            {
                path: 'overview',
                component: OverviewComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'qa-forum',
                        pathMatch: 'full',
                    },
                    {
                        path: 'qa-forum',
                        component: QaForumViewComponent,
                    },
                    {
                        path: 'articles',
                        component: ArticlesViewComponent,
                    },
                    {
                        path: 'coffee-recipes',
                        component: CoffeeRecipesViewComponent,
                    },
                    {
                        path: 'about-era-of-we',
                        component: EraOfWeComponent,
                    },
                ],
            },
            {
                path: ':lang/overview',
                component: OverviewComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'qa-forum',
                        pathMatch: 'full',
                    },
                    {
                        path: 'qa-forum',
                        component: QaForumViewComponent,
                    },
                    {
                        path: 'articles',
                        component: ArticlesViewComponent,
                    },
                    {
                        path: 'coffee-recipes',
                        component: CoffeeRecipesViewComponent,
                    },
                    {
                        path: 'about-era-of-we',
                        component: EraOfWeComponent,
                    },
                ],
            },

            {
                path: 'qa/:idOrSlug',
                component: QuestionDetailComponent,
            },
            {
                path: ':lang/qa/:idOrSlug',
                component: QuestionDetailComponent,
            },
            {
                path: 'recipe/:idOrSlug',
                component: RecipeDetailComponent,
            },
            {
                path: ':lang/recipe/:idOrSlug',
                component: RecipeDetailComponent,
            },
            {
                path: 'en/article/:idOrSlug',
                component: ArticleDetailComponent,
            },
            {
                path: 'sv/article/:idOrSlug',
                component: ArticleDetailComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CoffeLabRoutingModule {}
