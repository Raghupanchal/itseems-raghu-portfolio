import { useEffect } from 'react';
import './styles.css';
import { PAGE_BODY_HTML, PAGE_SCRIPT_TEXT } from './portfolio-source';

function App() {
  useEffect(() => {
    const existing = document.querySelector('script[data-react-portfolio-runtime]');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.dataset.reactPortfolioRuntime = 'true';
    const scriptText = PAGE_SCRIPT_TEXT
      .replace(/^\{\s*"imports"\s*:\s*\{[\s\S]*?\}\s*\}\s*/m, '')
      .replace(/\\`/g, '`')
      .replace(/\\\$\{/g, '${');
    script.textContent = scriptText;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: PAGE_BODY_HTML }} />;
}

export default App;
