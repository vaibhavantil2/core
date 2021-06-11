import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DataModule } from '../../../../shared/data/data.module';
import { ComponentsModule } from '../../../../shared/components/components.module';
import { ClickOutsideModule } from 'ng-click-outside';

import { Glue42Ng } from "@glue42/ng";
import GlueWebPlatform, { Glue42WebPlatform } from "@glue42/web-platform";
import Glue from "@glue42/desktop";
import GlueWorkspaces from "@glue42/workspaces-api";

import { start } from "./demo-plugin";
import { handleTransactionOpen, openWorkspace } from './notification.handlers';
import { Client } from 'shared/interfaces/ng-interfaces';
import { RouterModule } from '@angular/router';

// notifications: {
//   defaultClick: handleTransactionOpen,
//   actionClicks: [
//     { action: "newWsp", handler: (glue, definition) => openWorkspace(glue, (definition.data.client as Client), true) },
//     { action: "existingWsp", handler: (glue, definition) => openWorkspace(glue, (definition.data.client as Client), false) },
//   ]
// }

const swPromise = navigator.serviceWorker.register('/service-worker.js');

const config: Glue42WebPlatform.Config = {
  glue: {
    libraries: [GlueWorkspaces],
    systemLogger: {
      level: "warn"
    }
  },
  gateway: {
    logging: { level: "warn" }
  },
  workspaces: {
    src: "/workspaces",
    hibernation: {
      maximumActiveWorkspaces: {
        threshold: 3
      }
    }
  },
  applications: {
    local: [
      {
        name: "clients",
        type: "window",
        details: {
          url: "/clients"
        }
      },
      {
        name: "news",
        type: "window",
        details: {
          url: "/news"
        }
      },
      {
        name: "portfolio",
        type: "window",
        details: {
          url: "/portfolio"
        }
      },
      {
        name: "transactions",
        type: "window",
        details: {
          url: "/transactions"
        }
      },
      {
        name: "trigger",
        type: "window",
        details: {
          url: "http://localhost:9100/"
        }
      }
    ]
  },
  plugins: {
    definitions: [
      {
        name: "demo",
        start: start,
        config: { sw: swPromise }
      }
    ]
  },
  serviceWorker: {
    registrationPromise: swPromise
  }
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    HttpClientModule,
    Glue42Ng.forRoot({
      webPlatform: { factory: GlueWebPlatform, config: config },
      desktop: {
        factory: (config) => {
          return Glue(config)
            .then((glue) => {
              start(glue, undefined);
              return glue;
            })
        },
        config: { appManager: "full", layouts: "full", libraries: [GlueWorkspaces] }
      }
    }),
    DataModule.forRoot(),
    ComponentsModule,
    ClickOutsideModule,
    RouterModule.forRoot([]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
