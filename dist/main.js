"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const utils_1 = require("./utils");
const axios_1 = __importDefault(require("axios"));
// debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
const ref = github.context.ref;
const pushPayload = github.context.payload;
console.log('github-----', github);
console.log('github.context', github.context);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topRepository = core.getInput('repository');
            const githubToken = core.getInput('githubToken');
            const type = core.getInput('type');
            if (type === 'stringify') {
                const branch = (0, utils_1.getBranchByHead)(ref) || (0, utils_1.getBranchByTag)(ref);
                const { repository, pusher } = pushPayload || {};
                const { full_name } = repository || {};
                const { name: pusherName } = pusher || {};
                const [, outRepository] = full_name.split('/');
                const syncBranch = (0, utils_1.getSyncBranch)(ref);
                const tagUrl = (0, utils_1.getTagUrl)(topRepository || full_name);
                const timesTamp = (0, utils_1.formatTime)(new Date(), '{yy}-{mm}-{dd}-{h}-{i}-{s}');
                const tagName = `${outRepository}/${syncBranch}/${timesTamp}`;
                // `release/${timesTamp}&branch=${branch}&syncBranch=${syncBranch}&repository=${outRepository}`
                const tagMessage = {
                    branch,
                    syncBranch,
                    repository: outRepository,
                    pusherName
                };
                console.log('tagName: ', tagName);
                const ret = yield (0, axios_1.default)({
                    method: 'POST',
                    headers: {
                        Accept: 'application/vnd.github.v3+json',
                        'content-type': 'application/json',
                        Authorization: `Bearer ${githubToken}`
                    },
                    url: tagUrl,
                    data: {
                        tag_name: tagName,
                        body: JSON.stringify(tagMessage)
                    }
                });
                console.log('ret------: ', ret.data);
            }
            if (type === 'parse') {
                const { release } = pushPayload || {};
                const { body } = release || {};
                const tagInfo = JSON.parse(body);
                console.log('tagInfo: ', tagInfo);
                const { branch: tagBranch, syncBranch: tagSyncBranch, repository: tagRepository, pusherName } = tagInfo || {};
                console.log('branch: ', tagSyncBranch);
                console.log('syncBranch----', tagBranch);
                console.log('repository----', tagRepository);
                console.log('pusherName----', pusherName);
                core.exportVariable('BRANCH', tagBranch);
                core.exportVariable('syncBranch', tagSyncBranch);
                core.exportVariable('REPOSITORY', tagRepository);
            }
        }
        catch (error) {
            const e = error;
            core.setFailed(e.message);
        }
    });
}
run();
