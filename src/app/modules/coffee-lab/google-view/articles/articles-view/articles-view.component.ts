import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from 'primeng/dynamicdialog';
import { CoffeeLabService, GlobalsService, SEOService, ResizeService } from '@services';
import { SignupModalComponent } from '@app/modules/coffee-lab/components/signup-modal/signup-modal.component';
import { environment } from '@env/environment';
import { ResizeableComponent } from '@base-components';
import { SeoDescription, SeoTitle } from '@constants';
import { RouterSlug } from '@enums';
import { getLangRoute } from '@utils';

@Component({
    selector: 'app-articles-view',
    templateUrl: './articles-view.component.html',
    styleUrls: ['./articles-view.component.scss'],
})
export class ArticlesViewComponent extends ResizeableComponent implements OnInit {
    keyword?: string;
    translationsList: any[] = [];
    orderList: any[] = [];
    isAvailableTranslation?: any;
    selectedOrder = '';
    articlesData: any[] = [];
    isLoading = true;
    totalRecords = 0;
    rows = 9;
    page = 1;
    jsonLD: any;

    constructor(
        @Inject(PLATFORM_ID) private platformId: object,
        private dialogSrv: DialogService,
        private globalsService: GlobalsService,
        private route: ActivatedRoute,
        private router: Router,
        private seoService: SEOService,
        private toastService: ToastrService,
        protected resizeService: ResizeService,
        public coffeeLabService: CoffeeLabService,
    ) {
        super(resizeService);
    }

    ngOnInit(): void {
        this.setSEO();
        this.coffeeLabService.gotTranslations.pipe(takeUntil(this.unsubscribeAll$)).subscribe((language) => {
            this.orderList = [
                {
                    label: this.globalsService.languageJson?.latest,
                    value: 'latest',
                },
                {
                    label: this.globalsService.languageJson?.oldest,
                    value: 'oldest',
                },
            ];
            this.translationsList = [
                {
                    label: this.globalsService.languageJson?.yes,
                    value: true,
                },
                {
                    label: this.globalsService.languageJson?.no,
                    value: false,
                },
            ];
        });

        this.route.queryParamMap.subscribe((params) => {
            if (params.has('page')) {
                this.page = +params.get('page');
                if (this.page < 1) {
                    this.page = 1;
                }
            }
            this.getData();
            if (isPlatformBrowser(this.platformId)) {
                window.scrollTo(0, 0);
            }
        });
    }

    getData(): void {
        const params: any = {
            query: this.keyword,
            translations_available: this.isAvailableTranslation,
            sort_by: 'created_at',
            sort_order: this.selectedOrder === 'latest' || this.selectedOrder === '' ? 'desc' : 'asc',
            page: this.page,
            per_page: this.rows,
        };
        this.isLoading = true;
        this.coffeeLabService.getForumList('article', params).subscribe((res) => {
            if (res.success) {
                this.articlesData = res.result ?? [];
                this.totalRecords = res.result_info.total_count;
                this.articlesData.map((item) => {
                    item.content = this.globalsService.getJustText(item.content);
                    item.cardType = 'forum';
                    return item;
                });
            } else {
                this.toastService.error('Cannot get Articles data');
            }
            this.isLoading = false;
        });
    }

    paginate(event: any) {
        if (this.page !== event.page + 1) {
            this.router.navigate([], { queryParams: { page: event.page + 1 } });
        }
    }

    getLink(item) {
        const url = `/${getLangRoute(item.language)}/articles/${item.slug}`;
        return item.cardType === 'forum'
            ? url
            : `/${getLangRoute(this.coffeeLabService.currentForumLanguage)}/articles`;
    }

    gotoDetailPage(event, item: any) {
        event.stopPropagation();
        event.preventDefault();
        if (this.globalsService.getLimitCounter() > 0) {
            this.router.navigate([this.getLink(item)]);
        } else {
            this.dialogSrv.open(SignupModalComponent, { data: { isLimit: true } });
        }
    }

    setSEO() {
        const title = SeoTitle[this.coffeeLabService.currentForumLanguage][RouterSlug.ARTICLE];
        const description = SeoDescription[this.coffeeLabService.currentForumLanguage][RouterSlug.ARTICLE];
        this.seoService.setSEO(title, description);
    }

    setSchemaMackup() {
        const forumList: any[] = [];
        for (const forum of this.articlesData) {
            const itemData = {
                '@type': 'Article',
                '@id': `${environment.coffeeLabWeb}/${getLangRoute(
                    this.coffeeLabService.currentForumLanguage,
                )}/articles/${forum.slug}`,
                headline: forum.title,
                description: this.globalsService.getJustText(forum.content),
                image: forum.cover_image_url,
                datePublished: forum.created_at,
                author: {
                    '@type': 'Person',
                    name: forum.user_name,
                },
            };
            forumList.push(itemData);
        }

        this.jsonLD = {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        {
                            '@type': 'ListItem',
                            position: 1,
                            name: 'Overview',
                            item: `${environment.coffeeLabWeb}/${this.coffeeLabService.currentForumLanguage}`,
                        },
                        {
                            '@type': 'ListItem',
                            position: 2,
                            name: 'Posts',
                        },
                    ],
                },
                ...forumList,
            ],
        };
    }

    onFocus(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialogSrv.open(SignupModalComponent, {});
    }
}
