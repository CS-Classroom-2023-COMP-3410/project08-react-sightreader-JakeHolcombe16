import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
plugins: [react()],
server: {
port: 5173,
alias: {
    'abcjs' : 'abcjs/midi',
// You can change this if needed
}
}
});