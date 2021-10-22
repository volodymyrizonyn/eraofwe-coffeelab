import { Component, OnInit, Inject, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '@env/environment';
import { CoffeeLabService } from '@services';
import { RouterMap } from '@constants';
import { PostType, RouterSlug } from '@enums';
import { getLangRoute } from '@utils';

@Component({
    selector: 'app-join-community',
    templateUrl: './join-community.component.html',
    styleUrls: ['./join-community.component.scss'],
})
export class JoinCommunityComponent implements OnInit {
    readonly RouterMap = RouterMap;
    readonly RouterSlug = RouterSlug;
    ssoWeb = environment.ssoWeb;
    @Input() pages: number;
    @Input() type: PostType;
    @Input() detailType: string;
    idOrSlug: any;
    isStaging = environment.needProtect;
    relatedData = [];
    constructor(@Inject(DOCUMENT) private document: Document, public coffeeLabService: CoffeeLabService) {}

    ngOnInit(): void {
        this.getQaList();
    }

    getQaList() {
        this.coffeeLabService
            .getForumList('question', {
                page: this.pages ? this.pages + 1 : 2,
                per_page: 15,
            })
            .subscribe((res: any) => {
                if (res.success) {
                    this.relatedData = res.result?.questions || [];
                }
            });
    }

    getLink(item: any, answer: any) {
        const url = `/${getLangRoute(this.coffeeLabService.currentForumLanguage)}/qa-forum/${item.slug}`;
        return {
            url,
            queryParmas: {
                answer: answer?.id,
            },
        };
    }

    gotoSignup() {
        this.document.location.href = `${environment.ssoWeb}/sign-up`;
    }
}
