import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CoffeeLabService, GlobalsService, SEOService, ResizeService } from '@services';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from 'primeng/dynamicdialog';
import { SignupModalComponent } from '../../../components/signup-modal/signup-modal.component';
import { DOCUMENT } from '@angular/common';
import { environment } from '@env/environment';
import { ResizeableComponent } from '@base-components';
import { seoVariables } from '@constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
    selector: 'app-articles-view',
    templateUrl: './articles-view.component.html',
    styleUrls: ['./articles-view.component.scss'],
})
export class ArticlesViewComponent extends ResizeableComponent implements OnInit {
    keyword?: string;
    translationsList: any[] = [
        {
            label: 'Yes',
            value: true,
        },
        {
            label: 'No',
            value: false,
        },
    ];
    orderList: any[] = [
        {
            label: 'Latest',
            value: 'latest',
        },
        {
            label: 'Oldest',
            value: 'oldest',
        },
    ];
    isAvailableTranslation?: any;
    selectedOrder = 'latest';
    articlesData: any[] = [];
    displayData: any[] = [];
    isLoading = false;
    totalRecords = 0;
    jsonLD: any;
    destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        public coffeeLabService: CoffeeLabService,
        private toastService: ToastrService,
        private router: Router,
        public dialogSrv: DialogService,
        private globalsService: GlobalsService,
        @Inject(DOCUMENT) private document: Document,
        private seoService: SEOService,
        protected resizeService: ResizeService,
    ) {
        super(resizeService);
    }

    ngOnInit(): void {
        this.getData();
        this.setSEO();
        this.coffeeLabService.gotTranslations.pipe(takeUntil(this.destroy$)).subscribe((language) => {
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
    }

    getData(): void {
        this.isLoading = true;
        const params: any = {
            query: this.keyword,
            translations_available: this.isAvailableTranslation,
            sort_by: 'created_at',
            sort_order: this.selectedOrder === 'latest' ? 'desc' : 'asc',
            page: 1,
            per_page: 10000,
        };

        this.coffeeLabService.getForumList('article', params).subscribe((res) => {
            if (res.success) {
                this.articlesData = res.result ?? [];
                this.totalRecords = res.result_info.total_count;
                this.articlesData.map((item) => {
                    item.content = this.globalsService.getJustText(item.content);
                    item.cardType = 'forum';
                    return item;
                });
                const joinCard = {
                    cardType: 'joinCard',
                };
                if (this.articlesData.length < 3) {
                    this.articlesData.push(joinCard);
                } else {
                    this.articlesData.splice(2, 0, joinCard);
                }
                this.displayData = this.articlesData.slice(0, 9);
                this.setSchemaMackup();
            } else {
                this.toastService.error('Cannot get Articles data');
            }
            this.isLoading = false;
        });
    }

    paginate(event: any) {
        this.displayData = this.articlesData.slice(event.first, event.first + event.rows);
        this.setSchemaMackup();
    }

    getLink(item) {
        const url = `/${item.language}/articles/${item.slug}`;
        return item.cardType === 'forum' ? url : `/${this.coffeeLabService.currentForumLanguage}/articles`;
    }

    gotoDetailPage(event, item: any) {
        event.stopPropagation();
        event.preventDefault();
        if (this.globalsService.getLimitCounter() > 0) {
            this.router.navigate([this.getLink(item)]);
        } else {
            this.dialogSrv.open(SignupModalComponent, {
                data: {
                    isLimit: true,
                },
                showHeader: false,
                styleClass: 'signup-dialog',
            });
        }
    }

    setSEO() {
        const title =
            this.coffeeLabService.currentForumLanguage === 'en'
                ? 'Coffee articles & news - The Coffee Lab'
                : 'Kaffe artiklar & nyheter - The Coffee Lab';
        const description =
            this.coffeeLabService.currentForumLanguage === 'en'
                ? 'Coffee articles written by coffee experts from the coffee community'
                : 'Kaffe artiklar och nyheter skapade av kaffe experter från kaffeindustrin.';
        this.seoService.setPageTitle(title);
        this.seoService.setMetaData('name', 'description', description);

        this.seoService.setMetaData('property', 'og:title', title);
        this.seoService.setMetaData('property', 'og:description', description);
        this.seoService.setMetaData('property', 'og:url', this.document.URL);
        this.seoService.setMetaData('property', 'og:image', `${seoVariables.image}?v=${Date.now()}`);

        this.seoService.setMetaData('name', 'twitter:image', seoVariables.image);
        this.seoService.setMetaData('name', 'twitter:creator', seoVariables.author);
        this.seoService.setMetaData('name', 'twitter:site', this.document.URL);
        this.seoService.setMetaData('name', 'twitter:title', title);
        this.seoService.setMetaData('name', 'twitter:description', description);
    }

    setSchemaMackup() {
        const forumList: any[] = [];
        for (const forum of this.displayData) {
            const itemData = {
                '@type': 'Article',
                '@id': `${environment.coffeeLabWeb}/${this.coffeeLabService.currentForumLanguage}/articles/${forum.slug}`,
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
}
