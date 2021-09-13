import { Component, OnInit, Input } from '@angular/core';
import { CoffeeLabService, GlobalsService } from '@services';
import { DialogService } from 'primeng/dynamicdialog';
import { SignupModalComponent } from '../signup-modal/signup-modal.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-publish-forum',
    templateUrl: './publish-forum.component.html',
    styleUrls: ['./publish-forum.component.scss'],
})
export class PublishForumComponent implements OnInit {
    @Input() type: string;
    firstBtnValue: string;
    secondBtnValue: string;
    placeHolderValue: string;
    destroy$: Subject<boolean> = new Subject<boolean>();
    constructor(
        public dialogSrv: DialogService,
        private globals: GlobalsService,
        private coffeeLabService: CoffeeLabService,
    ) {}

    ngOnInit(): void {
        this.coffeeLabService.gotTranslations.pipe(takeUntil(this.destroy$)).subscribe((language) => {
            if (this.type === 'article') {
                this.firstBtnValue = this.globals.languageJson?.ask_a_question;
                this.secondBtnValue = this.globals.languageJson?.create_brew_guide;
                this.placeHolderValue = this.globals.languageJson?.write_post;
            } else if (this.type === 'recipe') {
                this.firstBtnValue = this.globals.languageJson?.ask_a_question;
                this.secondBtnValue = this.globals.languageJson?.write_post;
                this.placeHolderValue = this.globals.languageJson?.create_brew_guide;
            } else {
                this.firstBtnValue = this.globals.languageJson?.write_post;
                this.secondBtnValue = this.globals.languageJson?.create_brew_guide;
                this.placeHolderValue = this.globals.languageJson?.ask_your_question;
            }
        });
    }

    onFocus() {
        this.dialogSrv.open(SignupModalComponent, {
            showHeader: false,
            styleClass: 'signup-dialog',
        });
    }
}
