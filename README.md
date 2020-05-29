# data-dlg
[![CircleCI](https://circleci.com/gh/riversun/data-dlg.svg?style=shield)](https://circleci.com/gh/riversun/data-dlg)
[![codecov](https://codecov.io/gh/riversun/data-dlg/branch/master/graph/badge.svg)](https://codecov.io/gh/riversun/data-dlg)

data-dlg is data-binder for bsn boosted Bootstrap4 modal dialog.

- Support auto/manual data binding
- Support i18n resource

# install

via npm

```
npm install data-dlg
```

via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/data-dlg/lib/data-dlg.js"></script>
```

# import NPM project as ES module

```javascript
import DialogManager from "data-dlg";
```

# data-dlg apis

<table>
 <tr><td>Attribute Name</td><td>Attribute Value</td><td>Description</td></tr>
 <tr><td>data-dlg</td><td>dialogId</td><td>When you click on the element to which this attribute is given, the specified dialog (identified by diloagId) is automatically opened.</td></tr>
 <tr><td>data-dlg-resume</td><td>N/A</td><td>If the element with this attribute was a child element of a dialog with an element with this attribute, clicking on the element with this attribute will open the dialog specified by data-dlg, and after the opening dialog is closed, the dialog with the element with this attribute will open again.</td></tr>
 <tr><td>data-dlg-prop</td><td>Property Name</td><td>Specify for an input element (such as Input). The property name of the context variable and DOM element at the time of binding. E.g., the initial value of the Input element will show the name of this property out of context, and the input value of the Input element will be stored in the context variable of this property name.</td></tr>
 <tr><td>data-dlg-input-type</td><td>Property Type</td><td>Specify for an input element (such as Input). Property type "text" "number" "date" "date" "time" "datetime" to specify.</td></tr>
 <tr><td>data-dlg-focus</td><td>N/A</td><td>Specify for an input element (such as Input). Specify the input element to focus automatically when the dialog is displayed.</td></tr>
 <tr><td>data-dlg-enter-to-apply</td><td>N/A</td><td>Specify for an input element (such as Input). If you press enter in an input element, Apply will be issued automatically.</td></tr>
 <tr><td>data-dlg-hidden</td><td>Property Name</td><td>label element (such as a div or label). If the specified property is EMPTY, then the element with this attribute is hidden.</td></tr>
 <tr><td>data-dlg-ref</td><td>Property Name or SentenceId</td><td>Specified for selective elements (such as SELECT elements). Specify a name that indicates the list of candidates to be displayed in the selection type element. If there is a property specified by this attribute in the context, the property is used as a candidate list. If it does not exist in the context, it uses the resource name of the same name from the i18n resource as a search candidate list. Selective elements can use either multiple choice or single choice.</td></tr>
 <tr><td>data-dlg-multi-prop</td><td>Property Name</td><td>A property of array type that holds multiple values. Specify it for an enumerated type element (such as a SELECT element).</td></tr>
 <tr><td>data-dlg-key</td><td>String value</td><td>Use it with data-dlg-resume. When you come back from an external dialog, you can get it as an argument to the onResume method.</td></tr>
</table>




