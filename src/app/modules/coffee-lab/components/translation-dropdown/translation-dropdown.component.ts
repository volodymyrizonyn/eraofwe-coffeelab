import { Component, OnInit, Input } from '@angular/core';
import { getLangRoute } from '@utils';

@Component({
    selector: 'app-translation-dropdown',
    templateUrl: './translation-dropdown.component.html',
    styleUrls: ['./translation-dropdown.component.scss'],
})
export class TranslationDropdownComponent implements OnInit {
    @Input() translatedList;
    @Input() forumType;

    constructor() {}

    ngOnInit(): void {}

    getLink(item) {
        return `/${getLangRoute(item.language)}/${this.forumType ?? 'articles'}/${item.slug || item.question_slug}`;
    }
}
