import re

with open('src/layouts/BaseLayout.astro', 'r', encoding='utf-8') as f:
    content = f.read()

script = """
    <!-- React DOM Injection Script for SEO Content -->
    <script is:inline>
      (function() {
        if (document.documentElement.classList.contains('has-react')) {
          document.addEventListener('DOMContentLoaded', () => {
            const staticMain = document.getElementById('main-content');
            if (!staticMain) return;
            
            const staticNodes = Array.from(staticMain.childNodes);
            const nodesBeforeCalc = [];
            const nodesAfterCalc = [];
            let passedCalc = false;
            
            for (const node of staticNodes) {
              if (node.nodeType === 1 && node.classList && node.classList.contains('calculator-container')) {
                passedCalc = true;
                continue;
              }
              if (!passedCalc) nodesBeforeCalc.push(node);
              else nodesAfterCalc.push(node);
            }
            
            const observer = new MutationObserver((mutations, obs) => {
              const reactMain = document.querySelector('#root main#main-content');
              if (reactMain) {
                // React has rendered!
                const calcEl = reactMain.firstChild;
                
                // Prepend content
                // We wrap it in a div to avoid React unmounting it during state changes
                const preDiv = document.createElement('div');
                preDiv.className = 'injected-seo-pre';
                nodesBeforeCalc.forEach(n => preDiv.appendChild(n));
                reactMain.insertBefore(preDiv, calcEl);
                
                // Append content
                const postDiv = document.createElement('div');
                postDiv.className = 'injected-seo-post';
                nodesAfterCalc.forEach(n => postDiv.appendChild(n));
                reactMain.appendChild(postDiv);
                
                obs.disconnect();
              }
            });
            
            observer.observe(document.getElementById('root'), { childList: true, subtree: true });
          });
        }
      })();
    </script>
"""

content = content.replace('<slot name="head" />', script + '\n    <slot name="head" />')

with open('src/layouts/BaseLayout.astro', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected SEO preservation script.")
