import './assets/base.scss';
import 'primevue/resources/themes/soho-light/theme.css';
import 'primeicons/primeicons.css';
import "primeflex/primeflex.css";

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import PrimeVue from 'primevue/config';

import { i18n } from './plugins/i18n';

import App from './App.vue';
import router from './router';
import FileUpload from 'primevue/fileupload';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import ProgressBar from 'primevue/progressbar';
import Panel from 'primevue/panel';
import ProgressSpinner from 'primevue/progressspinner';

const app = createApp(App)

app.use(createPinia());
app.use(router);

// Primevue components
app.use(PrimeVue);
app.component('FileUpload', FileUpload);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Checkbox', Checkbox);
app.component('InputText', InputText);
app.component('SelectButton', SelectButton);
app.component('Button', Button);
app.component('Badge', Badge);
app.component('ProgressBar', ProgressBar);
app.component('Panel', Panel);
app.component('ProgressSpinner', ProgressSpinner);

app.use(i18n);

app.mount('#app');
