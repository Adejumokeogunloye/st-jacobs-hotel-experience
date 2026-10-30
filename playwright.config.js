import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./browser-tests',workers:1,timeout:30000,use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:5183',launchOptions:{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'},headless:true},reporter:'list'});
