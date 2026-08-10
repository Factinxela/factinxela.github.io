# Web de Factinxela

Página promocional estática y sin dependencias externas.

## Verla en local

Abre `index.html` directamente en el navegador. También puede publicarse copiando todo el contenido de esta carpeta a cualquier alojamiento de archivos estáticos.

## Archivos

- `index.html`: estructura y contenidos.
- `styles.css`: diseño responsive, animaciones y estilos de impresión visual.
- `translations.js`: traducciones completas al gallego, catalán e inglés.
- `app.js`: selector de idioma, menú móvil, animaciones y galería ampliable. El idioma elegido se conserva en el navegador y también se puede abrir directamente con `?lang=gl`, `?lang=ca` o `?lang=en`.
- `assets/screenshots/`: diez capturas reales de la aplicación con datos ficticios, incluidas la importación bancaria y la creación de facturas rectificativas.
- `capture_screenshots.py`: generador reproducible de las capturas. Crea una base temporal y no accede a los datos reales de Factinxela.

Para regenerar las capturas en Windows:

```powershell
python web\capture_screenshots.py
```

En Windows, el generador utiliza automáticamente el motor gráfico nativo para que las tipografías y los caracteres acentuados se reproduzcan correctamente.
