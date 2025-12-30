// OS Communication Helper
const OS = {
    request: (action, payload) => {
        return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36).substring(7);

            const listener = (event) => {
                const data = event.data;
                if (data.requestId === requestId || data.reqId === requestId) {
                    window.removeEventListener('message', listener);
                    if (data.error) {
                        reject(data.error);
                    } else {
                        resolve(data.result || data);
                    }
                }
            };
            window.addEventListener('message', listener);

            window.parent.postMessage({
                target: 'OS_HOST',
                action: action,
                requestId: requestId,
                payload: payload
            }, '*');
        });
    },
    pickFile: (options) => OS.request('PICK_FILE', options),
    readFile: (path, filename) => OS.request('READ_FILE', { path, filename }),
    writeFile: (path, filename, content) => OS.request('WRITE_FILE', { path, filename, content })
};

// Application Logic
let editor;
let currentFile = null;

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: '// Welcome to Advanced Text Editor\n// Click Open to select a file...',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true
    });

    // Ctrl+S to save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        saveFile();
    });
});

const currentFileSpan = document.getElementById('current-file');
const statusDiv = document.getElementById('status');
const btnOpen = document.getElementById('btn-open');
const btnSave = document.getElementById('btn-save');

function updateStatus(msg, type = 'normal') {
    statusDiv.textContent = msg;
    if (type === 'error') statusDiv.style.color = '#ff6b6b';
    else if (type === 'success') statusDiv.style.color = '#51cf66';
    else statusDiv.style.color = '#888';

    // Reset after 3 seconds if not normal
    if (type !== 'normal') {
        setTimeout(() => {
            statusDiv.textContent = 'Ready';
            statusDiv.style.color = '#888';
        }, 3000);
    }
}

function updateTitle() {
    if (currentFile) {
        currentFileSpan.textContent = [...currentFile.path, currentFile.filename].join('/');
    } else {
        currentFileSpan.textContent = "No file opened";
    }
}

async function loadFile(path, filename) {
    updateStatus('Loading...', 'normal');
    try {
        const result = await OS.readFile(path, filename);
        if (result && result.content !== undefined) {
            // Determine language from extension
            const ext = filename.split('.').pop();
            // Basic mapping
            let lang = 'plaintext';
            if (['js', 'ts', 'json', 'html', 'css', 'py', 'md', 'xml', 'java', 'c', 'cpp'].includes(ext)) {
                lang = ext;
            }
            if (ext === 'ts') lang = 'typescript';
            if (ext === 'md') lang = 'markdown';
            if (ext === 'py') lang = 'python';

            const model = monaco.editor.createModel(result.content, lang, monaco.Uri.parse(filename));
            editor.setModel(model);

            currentFile = { path, filename };
            updateTitle();
            updateStatus('File loaded', 'success');
        } else {
            updateStatus('File empty or error', 'error');
        }
    } catch (err) {
        console.error(err);
        updateStatus(`Error: ${err}`, 'error');
    }
}

btnOpen.addEventListener('click', async () => {
    try {
        const result = await OS.pickFile({ mode: 'open' });
        if (result && result.success) {
            await loadFile(result.path, result.filename);
        }
    } catch (err) {
        console.error(err);
        updateStatus(`Error: ${err}`, 'error');
    }
});

async function saveFile() {
    const content = editor.getValue();

    if (currentFile) {
        // Save to current file
        updateStatus('Saving...', 'normal');
        try {
            await OS.writeFile(currentFile.path, currentFile.filename, content);
            updateStatus('Saved successfully', 'success');
        } catch (err) {
            updateStatus(`Save failed: ${err}`, 'error');
        }
    } else {
        // Save As
        try {
            const result = await OS.pickFile({ mode: 'save', defaultFileName: 'untitled.txt' });
            if (result && result.success) {
                currentFile = { path: result.path, filename: result.filename };
                updateTitle();
                // Write content
                await OS.writeFile(currentFile.path, currentFile.filename, content);
                updateStatus('Saved successfully', 'success');
            }
        } catch (err) {
            updateStatus(`Save failed: ${err}`, 'error');
        }
    }
}

btnSave.addEventListener('click', saveFile);

// Listen for commands from Host
window.addEventListener('message', (event) => {
    const data = event.data;
    if (data.action === 'OPEN_FILE') {
        const { path, filename } = data.payload;
        loadFile(path, filename);
    }
});
