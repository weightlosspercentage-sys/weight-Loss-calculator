import fs from 'fs';

['assets/index-Ctp2HkQJ.js', 'dist3/assets/index-Ctp2HkQJ.js'].forEach(f => {
  if (fs.existsSync(f)) {
    let txt = fs.readFileSync(f, 'utf8');
    const target = 's.jsx("a",{href:"/about",className:"font-semibold text-indigo-600 hover:text-indigo-700 hover:underline",children:"Dr. Rekha Kumar, M.D., M.S., LDN"})," ","(Registered Dietitian Nutritionist). We base all calorie and metabolic formulas on peer-reviewed guidelines from the CDC, WHO, and clinical studies."';
    const repl = 's.jsx("a",{href:"/authors/dr-rekha-kumar/",className:"font-semibold text-indigo-600 hover:text-indigo-700 hover:underline",children:"Dr. Rekha Kumar, M.D., M.S."})," ","(Associate Professor of Clinical Medicine at Weill Cornell & Former Medical Director, ABOM). We base all calculation models on peer-reviewed clinical guidelines from the ADA, AHA, and AAP."';
    if (txt.includes(target)) {
      txt = txt.replace(target, repl);
      fs.writeFileSync(f, txt, 'utf8');
      console.log('Successfully updated', f);
    } else {
      console.log('Target not found in', f);
    }
  }
});
