import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemFormService,
  IWorkItemLoadedArgs,
  WorkItemTrackingServiceIds,
  WorkItemTrackingRestClient 
} from "azure-devops-extension-api/WorkItemTracking";
import * as SDK from "azure-devops-extension-sdk";

import * as React from "react";
import { useRef, useState } from 'react';
import { showRootComponent } from "../common/common";

import {
  SelectableOptionMenuItemType,
  ThemeProvider,
  createTheme,
  IDropdown,
  Dropdown,
  IDropdownOption,
  IDropdownStyles,
  ResponsiveMode
} from '@fluentui/react';

import { initializeIcons } from '@fluentui/react/lib/Icons';
import "azure-devops-ui/Core/_platformCommon.scss";

initializeIcons(undefined, { disableWarnings: true });

const appTheme = createTheme({
  palette: {
    themePrimary: 'rgb(var(--palette-primary))',
    themeLighterAlt: '#eff6fc',
    themeLighter: '#deecf9',
    themeLight: '#c7e0f4',
    themeTertiary: '#71afe5',
    themeSecondary: '#2b88d8',
    themeDarkAlt: '#106ebe',
    themeDark: '#005a9e',
    themeDarker: '#004578',
    neutralLighterAlt: 'rgba(var(--palette-neutral-8),1)',
    neutralLighter: 'rgba(var(--palette-neutral-6),1)',
    neutralLight: 'rgba(var(--palette-neutral-4),1)',
    neutralQuaternaryAlt: 'rgba(var(--palette-neutral-10),1)',
    neutralQuaternary: 'rgba(var(--palette-neutral-20),1)',
    neutralTertiaryAlt: 'rgba(var(--palette-neutral-30),1)',
    neutralTertiary: 'rgba(var(--palette-neutral-60),1)',
    neutralSecondary: 'rgba(var(--palette-neutral-70),.08)',
    neutralPrimaryAlt: 'rgba(var(--palette-neutral-70),1)',
    neutralPrimary: 'rgba(var(--palette-neutral-100),1)',
    neutralDark: 'rgba(var(--palette-neutral-80),1)',
    black: 'rgba(var(--palette-neutral-100),1)',
    white: 'rgba(var(--palette-neutral-0),1)',
  }});

interface IItem
{
    previousLevelKey: string;
    options: IDropdownOption;
}

interface ILevelSettings
{
  label: string;
  items: IItem[];
  filterOnPreviousLevelKey: boolean;
}

interface ISettings
{
  levels: ILevelSettings[];
}


export const WorkItemSKUInput: React.FunctionComponent = () => {
      const[sourceURL, setSourceURL] = useState('');
      const[fieldName1, setFieldName1] = useState('');
      const[fieldName2, setFieldName2] = useState('');
      const[fieldName3, setFieldName3] = useState('');
      const[fieldName4, setFieldName4] = useState('');
      const[options1,setOptions1] = useState<IDropdownOption[]>([]);
      const[options2,setOptions2] = useState<IDropdownOption[]>([]);
      const[options3,setOptions3] = useState<IDropdownOption[]>([]);
      const[options4,setOptions4] = useState<IDropdownOption[]>([]);
      const[settings,setSettings] = useState<ISettings>();
      const[selectedItem1,setSelectedItem1] = useState("");
      const[selectedItem2,setSelectedItem2] = useState("");
      const[selectedItem3,setSelectedItem3] = useState("");
      const[selectedItem4,setSelectedItem4] = useState("");

  
  function getSettings() {
    if (!settings)
    {
      if (sourceURL)
      {
      fetch(sourceURL)
        // the JSON body is taken from the response
        .then(res => res.json())
        .then(res => {
                // The response has an `any` type, so we need to cast
                // it to the `User` type, and return it from the promise
                console.log("Downloading settings");
                
                var dlsettings = res as ISettings;

                var sett = settings;

                setSettings(sett);

                SDK.init().then(() => {

                  setFieldName1(SDK.getConfiguration().witInputs["FieldLevel1"]);
                  setFieldName2(SDK.getConfiguration().witInputs["FieldLevel2"]);
                  setFieldName3(SDK.getConfiguration().witInputs["FieldLevel3"]);
                  setFieldName4(SDK.getConfiguration().witInputs["FieldLevel4"]);
                  setSourceURL(SDK.getConfiguration().witInputs["SourceURL"]);
            
                  registerEvents();
                });
            
        });
      } else {
        console.log("No source URL set to retrieve options from");
      }
    }
  }

  function getOptions1(ap: string, wit: string) {

    var opts: IDropdownOption[] = [];

    if (settings?.levels[0] && settings?.levels[0].items.length > 0) {
      settings?.levels[0].items.forEach((i: IItem) => {
        opts.push({ key: i.options.key, text: i.options.key + " - " + i.options.text
        })
      });
    }
   
    console.log(opts);
    if (opts.length == 0) {
      opts.push({ key: "NOSKU", text: "No SKUs available", itemType: SelectableOptionMenuItemType.Normal, disabled: true});
    }

    setOptions1(opts);
  }

  React.useEffect(() => {
    getSettings();
  });

  const getCurrentValues = async () => {
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );

    workItemFormService.getFieldValue(fieldName1, {returnOriginalValue: true})
    .then((cv) => {
      console.log("Current value: " + cv);
      setSelectedItem1(cv ? cv.toString() : "");
    });
    workItemFormService.getFieldValue(fieldName2, {returnOriginalValue: true})
    .then((cv) => {
      console.log("Current value: " + cv);
      setSelectedItem2(cv ? cv.toString() : "");
    });
    workItemFormService.getFieldValue(fieldName3, {returnOriginalValue: true})
    .then((cv) => {
      console.log("Current value: " + cv);
      setSelectedItem3(cv ? cv.toString() : "");
    });
    workItemFormService.getFieldValue(fieldName4, {returnOriginalValue: true})
    .then((cv) => {
      console.log("Current value: " + cv);
      setSelectedItem4(cv ? cv.toString() : "");
    });

  }

  const registerEvents = () => {
      console.log("Registering events");
      SDK.register(SDK.getContributionId(), () => {
        return {
          // Called when the active work item is modified
          onFieldChanged: (args: IWorkItemFieldChangedArgs) => {
            console.log(`onFieldChanged - ${JSON.stringify(args)}`);
          },

          // Called when a new work item is being loaded in the UI
          onLoaded: async (args: IWorkItemLoadedArgs) => {
            console.log(`onLoaded - ${JSON.stringify(args)}`);

            getCurrentValues();

          },

          // Called when the active work item is being unloaded in the UI
          onUnloaded: (args: IWorkItemChangedArgs) => {
            console.log(`onUnloaded - ${JSON.stringify(args)}`);
          },

          // Called after the work item has been saved
          onSaved: (args: IWorkItemChangedArgs) => {
            console.log(`onSaved - ${JSON.stringify(args)}`);
          },

          // Called when the work item is reset to its unmodified state (undo)
          onReset: (args: IWorkItemChangedArgs) => {
            console.log(`onReset - ${JSON.stringify(args)}`);
            setSelectedItem1("");
            setSelectedItem2("");
            setSelectedItem3("");
            setSelectedItem4("");
          },

          // Called when the work item has been refreshed from the server
          onRefreshed: (args: IWorkItemChangedArgs) => {
            console.log(`onRefreshed - ${JSON.stringify(args)}`);
          }
        };
      });
  }

  const onChange = async (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );

    setSelectedItem1(option?.key.toString() ?? "");

    if (option) {
      workItemFormService.setFieldValue(fieldName1, option.key);
    }
  };

  const onFocus = () => {
    SDK.resize(undefined, 325);
  };
 

  const onCollapse = () => {
    SDK.resize(undefined, 100);
  };

  const dropdownStyles: Partial<IDropdownStyles> = { dropdown: { width: 300 } };
  const dropdownRef1 = React.useRef<IDropdown>(null);
  const dropdownRef2 = React.useRef<IDropdown>(null);
  const dropdownRef3 = React.useRef<IDropdown>(null);
  const dropdownRef4 = React.useRef<IDropdown>(null);
  
    return (
      <ThemeProvider theme={appTheme}>
        <Dropdown
          label="Level 1"
          componentRef={dropdownRef1}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onCollapse}
          options={options1}
          //styles={dropdownStyles}
          selectedKey={selectedItem1 ? selectedItem1 : null}
          responsiveMode={ResponsiveMode.large}
        />
        <Dropdown
          label="Level 2"
          componentRef={dropdownRef2}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onCollapse}
          options={options1}
          //styles={dropdownStyles}
          selectedKey={selectedItem2 ? selectedItem2 : null}
          responsiveMode={ResponsiveMode.large}
        />
      </ThemeProvider>
      );
  

}

export default WorkItemSKUInput;

showRootComponent(<WorkItemSKUInput />);
