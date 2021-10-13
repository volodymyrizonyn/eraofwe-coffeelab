import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecipeDetailRoutingModule } from './recipe-detail-routing.module';
import { SharedModule } from '@shared';
import { UserHeaderModule } from '@modules/coffee-lab/components/user-header/user-header.module';
import { TranslationDropdownModule } from '@modules/coffee-lab/components/translation-dropdown/translation-dropdown.module';
import { JoinCommunityModule } from '@modules/coffee-lab/components/join-community/join-community.module';
import { ForumMenuModule } from '@modules/coffee-lab/components/forum-menu/forum-menu.module';
import { NgxJsonLdModule } from 'ngx-json-ld';

import { RecipeDetailComponent } from './recipe-detail.component';
import { CategoryListModule } from '@modules/coffee-lab/components/category-list/category-list.module';
import { TranslateTostModule } from '@modules/coffee-lab/components/translate-toast/translate-toast.module';

@NgModule({
    declarations: [RecipeDetailComponent],
    imports: [
        CommonModule,
        RecipeDetailRoutingModule,
        SharedModule,
        UserHeaderModule,
        TranslationDropdownModule,
        JoinCommunityModule,
        ForumMenuModule,
        NgxJsonLdModule,
        CategoryListModule,
        TranslateTostModule,
    ],
})
export class RecipeDetailModule {}
