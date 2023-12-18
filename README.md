# m3u-playlist-cleaner

M3u playlist cleaner is a web application for parsing and extracting data from an uploaded m3u file.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Technical informations](#technical-informations)
- [Contributing](#contributing)

## Prerequisites
- Node.js 18.x or higher
- Windows, macOS, or Linux operating system

## Installation

1. Clone the repository and go to the application folder:

```bash
git clone https://github.com/gferreira71/m3u-playlist-cleaner.git

cd m3u-playlist-cleaner
```

2. Run the npm command to install and launch the application locally.

```bash
npm install

npm run dev
```

## Usage

To use the M3u playlist cleaner, follow these steps:

1. Upload your m3u or m3u8 file in the Source section.
2. Select the record you want to keep in your m3u file with the datatable.
3. If needed, use filtering form to filter all the records found in the m3u file.
4. Check if the selected records displayed in the datatable are the ones you want to keep.
5. Enter the m3u filename you want to create and click "Download M3U result file" button.

## Technical informations

This application is made in Vue 3 and Typescript using the PrimeVue UI component library.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.