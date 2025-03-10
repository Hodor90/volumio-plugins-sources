import ytmusic from '../../../YTMusicContext';
import Model, { type ModelOf, ModelType } from '../../../model';
import { type BaseModel } from '../../../model/BaseModel';
import { type PageElement } from '../../../types';
import { type QueueItem } from './ExplodableViewHandler';
import {type ContinuationBundle} from './View';
import type View from './View';
import {type RenderedPage} from './ViewHandler';
import type ViewHandler from './ViewHandler';
import ViewHelper from './ViewHelper';
import Renderer, { type RendererOf, RendererType } from './renderers';
import {type RenderedListItem} from './renderers/BaseRenderer';
import type BaseRenderer from './renderers/BaseRenderer';

export interface ContinuationData {
  continuation: PageElement.Continuation;
  prevItemCount: number;
  bundle: ContinuationBundle;
}

export default class BaseViewHandler<V extends View> implements ViewHandler {

  #uri: string;
  #currentView: V;
  #previousViews: View[];
  #models: Partial<Record<ModelType, BaseModel>>;
  #renderers: Partial<Record<RendererType, BaseRenderer<any>>>;

  constructor(uri: string, currentView: V, previousViews: View[]) {
    this.#uri = uri;
    this.#currentView = currentView;
    this.#previousViews = previousViews;
    this.#models = {};
    this.#renderers = {};
  }

  browse(): Promise<RenderedPage> {
    return Promise.resolve({});
  }

  explode(): Promise<QueueItem[]> {
    throw Error('Operation not supported');
  }

  get uri(): string {
    return this.#uri;
  }

  get currentView(): V {
    return this.#currentView;
  }

  get previousViews(): View[] {
    return this.#previousViews;
  }

  protected getModel<T extends ModelType>(type: T): ModelOf<T> {
    if (!this.#models[type]) {
      let model;
      switch (type) {
        case ModelType.Account:
          model = Model.getInstance(ModelType.Account);
          break;
        case ModelType.Config:
          model = Model.getInstance(ModelType.Config);
          break;
        case ModelType.Endpoint:
          model = Model.getInstance(ModelType.Endpoint);
          break;
        case ModelType.Playlist:
          model = Model.getInstance(ModelType.Playlist);
          break;
        case ModelType.Search:
          model = Model.getInstance(ModelType.Search);
          break;
        case ModelType.MusicItem:
          model = Model.getInstance(ModelType.MusicItem);
          break;
        default:
          throw Error(`Unknown model type: ${type}`);
      }
      this.#models[type] = model;
    }

    return this.#models[type] as ModelOf<T>;
  }

  protected getRenderer<T extends RendererType>(type: T): RendererOf<T> {
    if (!this.#renderers[type]) {
      let renderer: BaseRenderer<any, any>;
      switch (type) {
        case RendererType.Channel:
          renderer = Renderer.getInstance(RendererType.Channel, this.#uri,
            this.#currentView, this.#previousViews);
          break;
        case RendererType.EndpointLink:
          renderer = Renderer.getInstance(RendererType.EndpointLink, this.#uri,
            this.#currentView, this.#previousViews);
          break;
        case RendererType.Option:
          renderer = Renderer.getInstance(RendererType.Option, this.#uri,
            this.#currentView, this.#previousViews);
          break;
        case RendererType.OptionValue:
          renderer = Renderer.getInstance(RendererType.OptionValue, this.#uri,
            this.#currentView, this.#previousViews);
          break;
        case RendererType.Album:
          renderer = Renderer.getInstance(RendererType.Album, this.#uri,
            this.#currentView, this.#previousViews);
          break;
        case RendererType.Playlist:
          renderer = Renderer.getInstance(RendererType.Playlist, this.#uri,
            this.#currentView, this.#previousViews);
          break;
        case RendererType.Podcast:
          renderer = Renderer.getInstance(RendererType.Podcast, this.#uri,
            this.#currentView, this.#previousViews);
          break;
        case RendererType.MusicItem:
          renderer = Renderer.getInstance(RendererType.MusicItem, this.#uri,
            this.#currentView, this.#previousViews);
          break;
        default:
          throw Error(`Unknown renderer type: ${type}`);
      }
      this.#renderers[type] = renderer;
    }
    return this.#renderers[type] as RendererOf<T>;
  }

  protected constructPrevUri() {
    return ViewHelper.constructPrevUri(this.#currentView, this.#previousViews);
  }

  #constructContinuationUri(data: ContinuationData) {
    const { continuation, prevItemCount, bundle } = data;
    const endpoint = continuation.endpoint;

    const segments = this.#previousViews.map((view) => ViewHelper.constructUriSegmentFromView(view));

    const newView: View = {
      ...this.#currentView,
      continuation: { endpoint, prevItemCount }
    };

    const prevContinuations = this.#currentView.prevContinuations || [];
    if (this.#currentView.continuation) {
      prevContinuations.push(this.#currentView.continuation);
    }
    if (prevContinuations.length > 0) {
      newView.prevContinuations = prevContinuations;
    }
    else {
      delete newView.prevContinuations;
    }

    if (bundle) {
      newView.continuationBundle = bundle;
    }

    segments.push(`${ViewHelper.constructUriSegmentFromView(newView)}@noExplode=1`);

    return segments.join('/');
  }

  protected constructContinuationItem(data: ContinuationData): RenderedListItem {
    return {
      service: 'ytmusic',
      type: 'item-no-menu',
      'title': data.continuation.text || ytmusic.getI18n('YTMUSIC_MORE'),
      'uri': this.#constructContinuationUri(data),
      'icon': 'fa fa-arrow-circle-right'
    };
  }
}
