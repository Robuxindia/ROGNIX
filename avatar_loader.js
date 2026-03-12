async function loadPlayerAvatar(scene, playerGroup) {
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (!localUser) return {};

    const parts = {};
    const createPart = (w, h, d, x, y, z, name) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshPhongMaterial({ color: 0xffcc00 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        playerGroup.add(mesh);
        parts[name] = mesh;
        return mesh;
    };

    // Body Setup
    const lLeg = createPart(2, 4, 2, -1, 2, 0, 'leftLeg');
    const rLeg = createPart(2, 4, 2, 1, 2, 0, 'rightLeg');
    const torso = createPart(4, 4, 2, 0, 6, 0, 'torso');
    const lArm = createPart(2, 4, 2, -3, 6, 0, 'leftArm');
    const rArm = createPart(2, 4, 2, 3, 6, 0, 'rightArm');
    const head = createPart(2, 2, 2, 0, 9, 0, 'head');

    // Pivot points for animation
    lLeg.geometry.translate(0, -2, 0); lLeg.position.y = 4;
    rLeg.geometry.translate(0, -2, 0); rLeg.position.y = 4;
    lArm.geometry.translate(0, -2, 0); lArm.position.y = 8;
    rArm.geometry.translate(0, -2, 0); rArm.position.y = 8;

    try {
        const userRes = await fetch('/api/user/' + localUser.username);
        const user = await userRes.json();
        const catRes = await fetch('/api/catalog');
        const catalog = await catRes.json();
        const equipped = user.avatar || { color: '#ffcc00' };

        const skin = new THREE.Color(equipped.color);
        parts.head.material.color.set(skin);
        parts.leftArm.material.color.set(skin);
        parts.rightArm.material.color.set(skin);

        // Clothes
        parts.torso.material.color.set(equipped.shirt ? new THREE.Color(catalog.find(i => i.id === equipped.shirt).color) : 0x0000ff);
        const pCol = equipped.pants ? new THREE.Color(catalog.find(i => i.id === equipped.pants).color) : 0x00ff00;
        parts.leftLeg.material.color.set(pCol); parts.rightLeg.material.color.set(pCol);

        // Accs
        if(equipped.hat) {
            const item = catalog.find(i => i.id === equipped.hat);
            if(item) {
                const hat = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 2.5), new THREE.MeshPhongMaterial({color: item.color}));
                hat.position.y = 1.2; parts.head.add(hat);
            }
        }
        if(equipped.face) {
            const item = catalog.find(i => i.id === equipped.face);
            if(item) {
                const tex = new THREE.TextureLoader().load(item.image);
                const face = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
                face.position.z = 1.01; parts.head.add(face);
            }
        }
        
        // Name tag
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256; canvas.height = 64;
        ctx.fillStyle = 'white'; ctx.font = 'Bold 40px Arial'; ctx.textAlign = 'center';
        ctx.fillText(user.username, 128, 45);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.CanvasTexture(canvas)}));
        sprite.position.y = 11; sprite.scale.set(4, 1, 1);
        playerGroup.add(sprite);

    } catch (e) { console.error(e); }
    
    return parts;
}