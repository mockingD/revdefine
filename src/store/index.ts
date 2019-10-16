import Vue from 'vue';
import Vuex, { StoreOptions, ActionContext } from 'vuex';
import { RootState, Settings } from './types';
import Client from 'src/client/deployService';
import { LightBlockInfo } from '../client/types';
import { BlockStore } from './blockStore';
import { stat } from 'fs';

Vue.use(Vuex);

const DEFAULT_GRPCPROXYHOST = 'http://127.0.0.1:8088';
const DEFAULT_WEBSOCKET = 'http://127.0.0.1:8089';
const DEFAULT_INITBLOCKCOUNT = 10;
const DEFAULT_MAXCACHEDBLOCKCOUNT = 200;

const store: StoreOptions<RootState> = {
  state: {
    version: '0.0.1',
    settings: {
      GRPCProxyHost: DEFAULT_GRPCPROXYHOST,
      WebsocketHost: DEFAULT_WEBSOCKET,
      InitBlockCount: DEFAULT_INITBLOCKCOUNT,
      MaxCachedBlockCount: DEFAULT_MAXCACHEDBLOCKCOUNT
    },
    client: new Client(DEFAULT_GRPCPROXYHOST),
    blockStore: new BlockStore(DEFAULT_MAXCACHEDBLOCKCOUNT)
  },
  getters: {
    getGRPCProxyHost: (state: RootState) => {
      return state.settings.GRPCProxyHost;
    },
    getWebsocketHost: (state: RootState) => {
      return state.settings.WebsocketHost;
    },
    getInitBlockCount: (state: RootState) => {
      return state.settings.InitBlockCount;
    },
    getMaxCachedBlockCount: (state: RootState) => {
      return state.settings.MaxCachedBlockCount;
    }
  },
  mutations: {
    resetSettings: (state: RootState, settings: Settings) => {
      state.settings.GRPCProxyHost = settings.GRPCProxyHost;
      state.settings.WebsocketHost = settings.WebsocketHost;
      state.settings.InitBlockCount = settings.InitBlockCount;
      state.settings.MaxCachedBlockCount = settings.MaxCachedBlockCount;
      state.client = new Client(settings.GRPCProxyHost);
      state.blockStore = new BlockStore(settings.MaxCachedBlockCount);
    },
    addBlockInfo: (state: RootState, blockInfo: LightBlockInfo) => {
      state.blockStore.addBlock(blockInfo);
    }
  },
  actions: {
    reconfigSettings(context: ActionContext<RootState, RootState>, settings: Settings) {
      context.commit('resetSettings', settings);
    },
    async fetchBlocks(context: ActionContext<RootState, RootState>, depth: number = 10) {
      const blocks = await context.state.client.showBlocks(depth);
      blocks.forEach(lightBlock => {
        context.commit('addBlockInfo', lightBlock);
      });
    }
    // async fetchBlock(context: ActionContext<RootState, RootState>, blockHash: string) => Primise<BlockInfo> {
    // return await context.state.client.showBlock(blockHash);
    // }
  }
};

export default new Vuex.Store<RootState>(store);
