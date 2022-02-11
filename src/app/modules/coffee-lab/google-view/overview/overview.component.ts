import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResizeableComponent } from '@base-components';
import { RouterMap, SlugMap } from '@constants';
import { PostType, RouterSlug } from '@enums';
import { SignupModalComponent } from '@modules/coffee-lab/components/signup-modal/signup-modal.component';
import { CoffeeLabService, ResizeService, StartupService } from '@services';
import { getLangRoute } from '@utils';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent extends ResizeableComponent implements OnInit {
    menuItems: MenuItem[] = [];
    postType: PostType;
    cuurentRoasterSlug: RouterSlug;
    isGlobalSearchResultPage = false;
    isLoading: boolean;
    keyword: string;
    searchResult: any;
    searchInput$: Subject<any> = new Subject<any>();
    constructor(
        private coffeeLabService: CoffeeLabService,
        private router: Router,
        private startupService: StartupService,
        protected resizeService: ResizeService,
        private dialogSrv: DialogService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
    ) {
        super(resizeService);
        this.searchInput$.pipe(debounceTime(1000)).subscribe(() => {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { search: this.keyword },
                queryParamsHandling: 'merge',
            });
            this.startSearch();
        });
        const searchQueryParam = this.route.snapshot.queryParamMap.get('search');
        if (searchQueryParam) {
            this.keyword = searchQueryParam;
            this.searchInput$.next(this.keyword);
        }
    }

    ngOnInit(): void {
        this.coffeeLabService.forumLanguage.pipe(takeUntil(this.unsubscribeAll$)).subscribe((language) => {
            this.menuItems = this.getMenuItems(language);
            this.startupService.load(language);
            if (this.router.url !== this.handleRoute(language).destinationRouter) {
                this.router.navigate([this.handleRoute(language).destinationRouter], { queryParamsHandling: 'merge' });
            }
            if (this.keyword) {
                this.startSearch();
            }
            this.setPostType(this.handleRoute(language).curRouterSlug);
        });
    }

    setPostType(routerSlug: RouterSlug) {
        this.cuurentRoasterSlug = routerSlug;
        switch (routerSlug) {
            case RouterSlug.QA: {
                this.postType = PostType.QA;
                break;
            }
            case RouterSlug.ARTICLE: {
                this.postType = PostType.ARTICLE;
                break;
            }
            case RouterSlug.RECIPE: {
                this.postType = PostType.RECIPE;
                break;
            }
            case RouterSlug.EOW: {
                this.postType = PostType.ARTICLE;
                break;
            }
        }
    }

    handleRoute(language) {
        if (!this.keyword) {
            this.isGlobalSearchResultPage = false;
        }
        this.searchResult = [];
        this.coffeeLabService.searchResult.next(this.searchResult);
        let currentRouter = this.router.url;
        if (currentRouter) {
            currentRouter = currentRouter.split('/')[2].split('?')[0];
        }
        const curRouterSlug = SlugMap[currentRouter] || RouterSlug.QA;
        const curRouterMap = RouterMap[language] || RouterMap.en;
        const destinationRouter = `/${getLangRoute(language)}/${curRouterMap[curRouterSlug]}`;
        return { destinationRouter, curRouterSlug };
    }

    getMenuItems(language) {
        const curRouterMap = RouterMap[language] || RouterMap.en;
        let menuItems = [];
        if (this.isGlobalSearchResultPage) {
            if (this.searchResult?.questions && this.searchResult?.questions.length > 0) {
                menuItems.push({
                    label: 'question_answers',
                    routerLink: `/${getLangRoute(language)}/${curRouterMap[RouterSlug.QA]}`,
                    queryParams: { search: this.keyword },
                    command: () => this.setPostType(RouterSlug.QA),
                });
            }
            if (this.searchResult?.articles && this.searchResult?.articles.length > 0) {
                menuItems.push({
                    label: 'posts',
                    routerLink: `/${getLangRoute(language)}/${curRouterMap[RouterSlug.ARTICLE]}`,
                    queryParams: { search: this.keyword },
                    command: () => this.setPostType(RouterSlug.ARTICLE),
                });
            } else {
                this.postType = PostType.QA;
                this.router.navigate(
                    [
                        `/${getLangRoute(this.coffeeLabService.currentForumLanguage)}/${
                            RouterMap[this.coffeeLabService.currentForumLanguage] || RouterMap.en[RouterSlug.QA]
                        }`,
                    ],
                    {
                        relativeTo: this.route,
                        queryParams: { search: this.keyword },
                        queryParamsHandling: 'merge',
                    },
                );
            }
            if (this.searchResult?.recipes && this.searchResult?.recipes.length > 0) {
                menuItems.push({
                    label: 'brewing_guides',
                    routerLink: `/${getLangRoute(language)}/${curRouterMap[RouterSlug.RECIPE]}`,
                    queryParams: { search: this.keyword },
                    command: () => this.setPostType(RouterSlug.RECIPE),
                });
            } else {
                this.postType = PostType.QA;
                this.router.navigate(
                    [
                        `/${getLangRoute(this.coffeeLabService.currentForumLanguage)}/${
                            RouterMap[this.coffeeLabService.currentForumLanguage] || RouterMap.en[RouterSlug.QA]
                        }`,
                    ],
                    {
                        relativeTo: this.route,
                        queryParams: { search: this.keyword },
                        queryParamsHandling: 'merge',
                    },
                );
            }
        } else {
            menuItems = [
                {
                    label: 'question_answers',
                    routerLink: `/${getLangRoute(language)}/${curRouterMap[RouterSlug.QA]}`,
                    command: () => this.setPostType(RouterSlug.QA),
                },
                {
                    label: 'posts',
                    routerLink: `/${getLangRoute(language)}/${curRouterMap[RouterSlug.ARTICLE]}`,
                    command: () => this.setPostType(RouterSlug.ARTICLE),
                },
                {
                    label: 'brewing_guides',
                    routerLink: `/${getLangRoute(language)}/${curRouterMap[RouterSlug.RECIPE]}`,
                    command: () => this.setPostType(RouterSlug.RECIPE),
                },
                {
                    label: 'about_era_of_we',
                    routerLink: `/${getLangRoute(language)}/${curRouterMap[RouterSlug.EOW]}`,
                    command: () => this.setPostType(RouterSlug.EOW),
                },
            ];
        }
        return menuItems;
    }

    onWrite() {
        this.dialogSrv.open(SignupModalComponent, {});
    }

    handleSearch(): void {
        this.searchInput$.next(this.keyword);
        if (!this.keyword) {
            this.isGlobalSearchResultPage = false;
            this.searchResult = [];
            this.coffeeLabService.searchResult.next(this.searchResult);
            this.router.navigate([this.handleRoute(this.coffeeLabService.currentForumLanguage).destinationRouter]);
            this.menuItems = this.getMenuItems(this.coffeeLabService.currentForumLanguage);
        }
    }

    startSearch(): void {
        if (!this.keyword) {
            return;
        }
        this.isLoading = true;
        this.isGlobalSearchResultPage = true;
        const params = {
            query: this.keyword,
            sort_by: 'created_at',
            sort_order: 'desc',
            publish: true,
            page: 1,
            per_page: 10000,
        };
        forkJoin([
            this.coffeeLabService.getForumList('question', params),
            this.coffeeLabService.getForumList('article', params),
            this.coffeeLabService.getForumList('recipe', params),
        ]).subscribe((res: any[]) => {
            const questions = res[0]?.result?.questions || [];
            const articles = res[1]?.result || [];
            const recipes = res[2]?.result || [];
            this.searchResult = {
                questions,
                articles,
                recipes,
                total_count: questions.length + articles.length + recipes.length,
            };
            this.coffeeLabService.searchResult.next(this.searchResult);
            this.menuItems = this.getMenuItems(this.coffeeLabService.currentForumLanguage);
            this.handleSearchRoute();
            this.isLoading = false;
            this.cdr.detectChanges();
        });
    }

    handleSearchRoute() {
        if (
            this.searchResult?.questions &&
            this.searchResult?.questions.length > 0 &&
            this.router.url.includes(
                `/${getLangRoute(this.coffeeLabService.currentForumLanguage)}/${
                    RouterMap[this.coffeeLabService.currentForumLanguage] || RouterMap.en[RouterSlug.QA]
                }`,
            )
        ) {
            this.postType = PostType.QA;
            this.router.navigate(
                [
                    `/${getLangRoute(this.coffeeLabService.currentForumLanguage)}/${
                        RouterMap[this.coffeeLabService.currentForumLanguage] || RouterMap.en[RouterSlug.QA]
                    }`,
                ],
                {
                    relativeTo: this.route,
                    queryParams: { search: this.keyword },
                    queryParamsHandling: 'merge',
                },
            );
        } else if (
            this.searchResult?.articles &&
            this.searchResult?.articles.length > 0 &&
            this.router.url.includes(
                `/${getLangRoute(this.coffeeLabService.currentForumLanguage)}/${
                    RouterMap[this.coffeeLabService.currentForumLanguage] || RouterMap.en[RouterSlug.ARTICLE]
                }`,
            )
        ) {
            this.postType = PostType.ARTICLE;
            this.router.navigate(
                [
                    `/${getLangRoute(this.coffeeLabService.currentForumLanguage)}/${
                        RouterMap[this.coffeeLabService.currentForumLanguage] || RouterMap.en[RouterSlug.ARTICLE]
                    }`,
                ],
                {
                    relativeTo: this.route,
                    queryParams: { search: this.keyword },
                    queryParamsHandling: 'merge',
                },
            );
        } else if (
            this.searchResult?.recipes &&
            this.searchResult?.recipes.length > 0 &&
            this.router.url.includes(
                `/${getLangRoute(this.coffeeLabService.currentForumLanguage)}/${
                    RouterMap[this.coffeeLabService.currentForumLanguage][RouterSlug.RECIPE]
                }`,
            )
        ) {
            this.postType = PostType.RECIPE;
            this.router.navigate(
                [
                    `/${getLangRoute(this.coffeeLabService.currentForumLanguage)}/${
                        RouterMap[this.coffeeLabService.currentForumLanguage][RouterSlug.RECIPE]
                    }`,
                ],
                {
                    relativeTo: this.route,
                    queryParams: { search: this.keyword },
                    queryParamsHandling: 'merge',
                },
            );
        }
    }

    onClose(): void {
        this.keyword = '';
        this.searchInput$.next('');
        this.isGlobalSearchResultPage = false;
        this.searchResult = [];
        this.coffeeLabService.searchResult.next(this.searchResult);
        this.router.navigate([this.handleRoute(this.coffeeLabService.currentForumLanguage).destinationRouter]);
        this.menuItems = this.getMenuItems(this.coffeeLabService.currentForumLanguage);
    }
}
