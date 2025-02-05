import {
    App,
    PluginSettingTab,
    Setting
} from 'obsidian';
import type WritingGoals from '../../main';
import { FileLabels } from '../../UI/goal/file-labels';
import { dailyGoalColor, goalColor, showGoalMessage, showProgressChart } from '../../UI/stores/goal-store';
import { DAILY_GOAL_BAR_COLOR, DAILY_GOAL_FRONTMATTER_KEY, GOAL_BAR_COLOR, GOAL_FRONTMATTER_KEY, VIEW_TYPE_GOAL } from '../constants';

  export class WritingGoalsSettingsTab extends PluginSettingTab {
    plugin: WritingGoals;
    fileLabels: FileLabels;
    defaultGoalColor: string;
    defaultDailyGoalColor: string;

    constructor(app: App, plugin: WritingGoals) {
      super(app, plugin);
      this.plugin = plugin;
      this.fileLabels = new FileLabels(this.app, this.plugin.settings);
    }

    display(): void {
      const { containerEl } = this;

      containerEl.empty();
      new Setting(containerEl)
        .setName('Display goals in file explorer')
        .setDesc('Display note and folder goals in the file explorer')
        .addToggle(toggle =>
          toggle
            .setValue(this.plugin.settings.showInFileExplorer)
            .onChange(async (value:boolean) => {
              this.plugin.settings.showInFileExplorer = value;
              await this.plugin.saveData(this.plugin.settings);
              this.fileLabels.initFileLabels();
            }));

      new Setting(containerEl)
        .setName('Display goal message')
        .setDesc('Display a summary message below the progress for the current goal')
        .addToggle(toggle =>
          toggle
            .setValue(this.plugin.settings.showGoalMessage)
            .onChange(async (value:boolean) => {
              this.plugin.settings.showGoalMessage = value;
              await this.plugin.saveData(this.plugin.settings);
              showGoalMessage.set(value);
            }));

      new Setting(containerEl)
        .setName('Display daily goal stats')
        .setDesc('Display a bar chart for goal history below the progress for the current goal')
        .addToggle(toggle =>
          toggle
            .setValue(this.plugin.settings.showProgressChart)
            .onChange(async (value:boolean) => {
              this.plugin.settings.showProgressChart = value;
              await this.plugin.saveData(this.plugin.settings);
              showProgressChart.set(value);
            }));

      new Setting(containerEl)
        .setName('Display single goal view')
        .setDesc('Disaply a single view for the goal progress. This setting should be enabled on mobile devices with small screens.')
        .addToggle(toggle =>
          toggle
            .setValue(this.plugin.settings.showSingleGoalView)
            .onChange(async (value:boolean) => {
              this.plugin.settings.showSingleGoalView = value;
              await this.plugin.saveData(this.plugin.settings);
              const moreThanOneGoalLeaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL).length > 1;
              const firstOpenGoalLeafPath = this.plugin.settings.goalLeaves[0];
              if(moreThanOneGoalLeaf && firstOpenGoalLeafPath){
                this.plugin.initLeaf(firstOpenGoalLeafPath);
              }
            }));

      new Setting(containerEl)
      .setName('Display goal on create')
      .setDesc('Display the goal progress view when you create or update the goal')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.showGoalOnCreateAndUpdate)
          .onChange(async (value:boolean) => {
            this.plugin.settings.showGoalOnCreateAndUpdate = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

      new Setting(containerEl)
        .setName('Allow negative daily goal progress')
        .setDesc('Negative daily progress counts will be displayed if less words are in a note or under a folder than at the start of the day')
        .addToggle(toggle =>
          toggle
            .setValue(this.plugin.settings.allowNegativeGoalProgress)
            .onChange(async (value:boolean) => {
              this.plugin.settings.allowNegativeGoalProgress = value;
              await this.plugin.saveData(this.plugin.settings);
              this.plugin.loadNoteGoalData();
            }));

      new Setting(containerEl)
      .setName('Exclude comments')
      .setDesc('Exclude markdown (%% %%) and HTML (<!-- -->) comments when counting words')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.excludeComments)
          .onChange(async (value:boolean) => {
            this.plugin.settings.excludeComments = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

      new Setting(containerEl)
      .setName('Goal frontmatter property name')
      .setDesc('The name for the frontmatter property to use for note goals (changing this setting will not update existing frontmatter)')
      .addText(text =>
        text
          .setValue(this.plugin.settings.customGoalFrontmatterKey)
          .onChange(async (value:string) => {
            value = value != '' ? value : GOAL_FRONTMATTER_KEY;
            this.plugin.settings.customGoalFrontmatterKey = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

      new Setting(containerEl)
      .setName('Daily goal frontmatter property name')
      .setDesc('The name for the frontmatter property to use for daily note goals (changing this setting will not update existing frontmatter)')
      .addText(text =>
        text
          .setValue(this.plugin.settings.customDailyGoalFrontmatterKey)
          .onChange(async (value:string) => {
            value = value != '' ? value : DAILY_GOAL_FRONTMATTER_KEY;
            this.plugin.settings.customDailyGoalFrontmatterKey = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

        const colorSetting = new Setting(containerEl)
          .setName('Goal progress bar color')
          .setDesc('Set a custom color for the goal progress bar')
          .addButton(button =>
            button
            .setIcon("lucide-rotate-ccw")
            .onClick(evt => {
              const input = colorSetting.controlEl.children[1] as HTMLInputElement;
              input.value = GOAL_BAR_COLOR;
              input.trigger("change");

            }))
            .addColorPicker(color =>
            color
              .setValue(this.plugin.settings.customGoalBarColor)
              .onChange(async (value:string) => {
                const defaultColor = GOAL_BAR_COLOR
                value = value != '' ? value : defaultColor;
                this.plugin.settings.customGoalBarColor = value;
                await this.plugin.saveData(this.plugin.settings);
                goalColor.set(value);
              }));

        const dailyColorSetting = new Setting(containerEl)
        .setName('Daily goal progress bar color')
        .setDesc('Set a custom color for the daily goal progress bar')
        .addButton(button =>
          button
          .setIcon("lucide-rotate-ccw")
          .onClick(evt => {
            const input = dailyColorSetting.controlEl.children[1] as HTMLInputElement;
            input.value = DAILY_GOAL_BAR_COLOR;
            input.trigger("change");
          }))
        .addColorPicker(color =>
          color
            .setValue(this.plugin.settings.customDailyGoalBarColor)
            .onChange(async (value:string) => {
              const defaultColor = DAILY_GOAL_BAR_COLOR
              value = value != '' ? value : defaultColor;
              this.plugin.settings.customDailyGoalBarColor = value;
              await this.plugin.saveData(this.plugin.settings);
              dailyGoalColor.set(value);
            }));
    }
  }