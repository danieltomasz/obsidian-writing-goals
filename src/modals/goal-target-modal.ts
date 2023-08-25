import { App, FuzzySuggestModal, TAbstractFile, TFile, type FuzzyMatch, TFolder } from 'obsidian';
import type { WritingGoalsSettings } from '../settings/settings';
import { createGoal } from '../stores/note-goal';
import { FileHelper } from '../IO/file';
import type WritingGoals from '../main';
import { GOAL_FRONTMATTER_KEY } from '../constants';
import type GoalModal from './goal-modal';
const EMPTY_TEXT = 'No files found to append content. Enter to create a new one.'
const PLACEHOLDER_TEXT = 'Type file to append to or create';
const instructions = [
    {command: '↑↓', purpose: 'to navigate'},
    {command: '↵', purpose: 'to append content to file'},
    {command: 'esc', purpose: 'to dismiss'}
];

export default class GoalTargetModal extends FuzzySuggestModal<TAbstractFile>{
    files: TAbstractFile[];
    newNoteResult: HTMLDivElement;
    suggestionEmpty: HTMLDivElement;
    obsFile: any;
    noSuggestion: boolean;
    settings: WritingGoalsSettings;
    plugin: WritingGoals;
    goalModal: GoalModal;

    constructor(app: App, goalModal:GoalModal, plugin:WritingGoals) {
        super(app);
        this.goalModal = goalModal;
        this.plugin = plugin;
        this.settings = this.plugin.settings;
        this.init();
    }

    init() {
        this.files = this.app.vault.getAllLoadedFiles();
        this.emptyStateText = EMPTY_TEXT;

        this.setPlaceholder(PLACEHOLDER_TEXT);
        this.setInstructions(instructions);
    }

    getItems(): TAbstractFile[] {
        const inputName = this.inputEl.value;
        if(inputName.length == 0 || this.files.filter(f => this.isMatch(f.path, inputName + '.md')).length > 0){
            return this.files;
        }
        const newFile: TFile = {basename: this.inputEl.value, path: undefined, stat: undefined, vault: undefined, extension: undefined, parent: undefined, name: undefined};
        newFile.path = this.inputEl.value;
        return [newFile, ...this.files];
    }
    
    getItemText(item: TAbstractFile): string {
        this.noSuggestion = false;
        return item.path;
    }
    
    onChooseItem(item: TAbstractFile, evt: MouseEvent | KeyboardEvent): void {
        this.goalModal.init(this.plugin, item);
        this.close();
        this.goalModal.open();
    }

    renderSuggestion(item: FuzzyMatch<TAbstractFile>, el: HTMLElement) {
        el.innerText = item.item.path.replace('.md', '');
    }

    itemInstructionMessage(resultEl: HTMLElement, message: string) {
        const el = document.createElement('kbd');
        el.addClass('suggestion-hotkey');
        el.innerText = message;
        resultEl.appendChild(el);
    }

    isMatch(input: string, match: string){
        return input.toLocaleLowerCase() == match.toLocaleLowerCase()
    }
    
}