// --- DOM ELEMENT REFERENCES ---
const tabButtons = document.querySelectorAll('.tab-button');
const multiStyleContent = document.getElementById('multi-style-content');
const labChallengesContent = document.getElementById('lab-challenges-content');

const scene1Canvas = document.getElementById('scene1-canvas');
const scene1Ctx = scene1Canvas.getContext('2d');
const scene2Canvas = document.getElementById('scene2-canvas');
const scene2Ctx = scene2Canvas.getContext('2d');
const scene3Canvas = document.getElementById('scene3-canvas');
const scene3Ctx = scene3Canvas.getContext('2d');
const scene4StCanvas = document.getElementById('scene4-st-canvas');
const scene4StCtx = scene4StCanvas.getContext('2d');
const scene4VtCanvas = document.getElementById('scene4-vt-canvas');
const scene4VtCtx = scene4VtCanvas.getContext('2d');
const scene5Canvas = document.getElementById('scene5-canvas');
const scene5Ctx = scene5Canvas.getContext('2d');

const initialVelocitySlider = document.getElementById('initial-velocity-slider');
const initialVelocityInput = document.getElementById('initial-velocity-input');
const accelerationSlider = document.getElementById('uniform-acceleration-slider');
const accelerationInput = document.getElementById('uniform-acceleration-input');
const timeSlider = document.getElementById('simulation-time-slider');
const timeInput = document.getElementById('simulation-time-input');
const startStopButton = document.getElementById('start-stop-button');
const resetButton = document.getElementById('reset-button');


// --- DATA FOR DYNAMIC CONTENT ---
const multiStyleData = {
    scene1: `<strong>Analogy:</strong> Distance is like your car's odometer reading (total path), while Displacement is like the straight-line route from your GPS.`,
    scene2: `<strong>Cause:</strong> Any change in an object's velocity—whether it speeds up, slows down, or changes direction—is directly caused by acceleration.`,
    scene3: `<strong>Model:</strong> The three Equations of Motion (v=u+at, s=ut+½at², 2as=v²-u²) are the mathematical model for predicting motion under constant acceleration.`,
    scene4: `<strong>Visual:</strong> On a Velocity-Time graph, the <strong>Slope</strong> represents Acceleration, and the <strong>Area</strong> under the line represents Displacement.`,
    scene5: `<strong>Fix Misconceptions:</strong> Uniform circular motion is not uniform velocity motion. Since the direction is always changing, the velocity is always changing, making it accelerated motion.`
};

const labChallengesData = {
    scene1: `<div class="challenge-item challenge-compare"><strong>COMPARE:</strong> Compare the Displacement and the Distance traveled for an object that travels 50 m forward and then 20 m backward.</div>`,
    scene2: `<div class="challenge-item challenge-observe"><strong>OBSERVE:</strong> Observe the difference in shape between a Distance-Time graph for uniform motion (straight line) and one for uniformly accelerated motion (curve).</div>`,
    scene3: `<div class="challenge-item challenge-experiment"><strong>EXPERIMENT:</strong> Set u=0, a=4 m/s² and run for 5s. Verify the final displacement using s=ut+½at² and by calculating the area under the v-t graph.</div>`,
    scene4: `<div class="challenge-item challenge-analyze"><strong>ANALYZE:</strong> From a v-t graph showing constant velocity, use the area tool to find the distance traveled and explain why acceleration was zero.</div>`,
    scene5: `<div class"challenge-item challenge-challenge"><strong>CHALLENGE:</strong> Use v=2πr/t to calculate the speed of an object in circular motion. Prove that if it exits the path, its motion becomes uniform velocity.</div>`
};

// --- SIMULATION STATE ---
let activeScene = 'scene1';
let simulator = null;

// --- Simulation Class ---
class MotionSimulator {
    constructor(ctx, scene) {
        this.ctx = ctx;
        this.scene = scene;
        this.isRunning = false;
        this.animationFrameId = null;
        this.startTime = null;

        this.u = 0; // initial velocity
        this.a = 0; // acceleration
        this.tMax = 0; // total time
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();
        this.u = parseFloat(initialVelocityInput.value);
        this.a = parseFloat(accelerationInput.value);
        this.tMax = parseFloat(timeInput.value);
        this.animate();
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);
    }

    reset() {
        this.stop();
        this.draw();
    }

    animate() {
        if (!this.isRunning) return;
        const elapsedTime = (Date.now() - this.startTime) / 1000;
        const t = Math.min(elapsedTime, this.tMax);

        this.update(t);

        if (t >= this.tMax) {
            this.stop();
        }

        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    update(t) {
        this.draw(t);
    }

    draw(t = 0) {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }

        switch (this.scene) {
            case 'scene1':
                this.drawScene1(t);
                break;
            case 'scene2':
                this.drawScene2(t);
                break;
            case 'scene3':
                this.drawScene3(t);
                break;
            case 'scene4':
                this.drawScene4(t);
                break;
            case 'scene5':
                this.drawScene5(t);
                break;
        }
    }

    drawScene1(t) {
        // --- CALCULATION ---
        const s = this.u * t + 0.5 * this.a * t * t; // displacement

        // To calculate distance, we need to find if the direction changed
        let distance = 0;
        if (this.a !== 0) {
            const turningTime = -this.u / this.a;
            if (turningTime > 0 && turningTime < t) {
                // Distance traveled before turning
                const s_turning = this.u * turningTime + 0.5 * this.a * turningTime * turningTime;
                // Distance traveled after turning
                const s_after_turning = (this.u + this.a * turningTime) * (t - turningTime) + 0.5 * this.a * (t - turningTime) * (t - turningTime);
                 distance = Math.abs(s_turning) + Math.abs(s - s_turning);

            } else {
                distance = Math.abs(s);
            }
        } else {
            distance = Math.abs(s);
        }

        const displacement = s;

        // --- DRAWING SETUP ---
        const carWidth = 40;
        const carHeight = 20;
        const roadY = this.ctx.canvas.height / 2 + 50;
        const startX = 60;
        const endX = this.ctx.canvas.width - 60;
        const roadLength = endX - startX;

        // Determine the maximum possible displacement to scale the animation
        const s_at_tMax = this.u * this.tMax + 0.5 * this.a * this.tMax * this.tMax;
        const turningTime = -this.u / this.a;
        let maxDisplacement = Math.abs(s_at_tMax);
        if (turningTime > 0 && turningTime < this.tMax) {
            const s_at_turning_point = this.u * turningTime + 0.5 * this.a * turningTime * turningTime;
            maxDisplacement = Math.max(Math.abs(s_at_tMax), Math.abs(s_at_turning_point));
        }
        maxDisplacement = Math.max(maxDisplacement, Math.abs(s_at_tMax));


        const scale = maxDisplacement > 0 ? roadLength / (maxDisplacement * 1.2) : 1;
        const carX = startX + displacement * scale;

        // --- DRAW ROAD & ELEMENTS ---
        // Road line
        this.ctx.beginPath();
        this.ctx.moveTo(startX, roadY);
        this.ctx.lineTo(endX, roadY);
        this.ctx.strokeStyle = '#aaa';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Start point
        this.ctx.beginPath();
        this.ctx.arc(startX, roadY, 5, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'green';
        this.ctx.fill();
        this.ctx.fillStyle = 'black';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Start', startX, roadY + 25);

        // --- DRAW DISPLACEMENT ARROW ---
        this.ctx.beginPath();
        this.ctx.moveTo(startX, roadY - 30);
        this.ctx.lineTo(carX, roadY - 30);
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        // Arrowhead
        const headlen = 10;
        const angle = Math.atan2(0, carX - startX);
        this.ctx.beginPath();
        this.ctx.moveTo(carX, roadY - 30);
        this.ctx.lineTo(carX - headlen * Math.cos(angle - Math.PI / 6), roadY - 30 - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(carX, roadY - 30);
        this.ctx.lineTo(carX - headlen * Math.cos(angle + Math.PI / 6), roadY - 30 - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.fillStyle = 'red';
        this.ctx.fillText('Displacement', startX + (carX - startX) / 2, roadY - 45);


        // --- DRAW CAR ---
        this.ctx.fillStyle = '#007BFF'; // Blue car
        this.ctx.fillRect(carX - carWidth / 2, roadY - carHeight, carWidth, carHeight);
        // Add wheels
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(carX - carWidth / 4, roadY, 5, 0, 2 * Math.PI);
        this.ctx.arc(carX + carWidth / 4, roadY, 5, 0, 2 * Math.PI);
        this.ctx.fill();


        // --- DRAW TEXT ---
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Time: ${t.toFixed(2)}s`, 20, 30);
        this.ctx.fillText(`Distance (path taken): ${distance.toFixed(2)}m`, 20, 60);
        this.ctx.fillText(`Displacement (straight line): ${displacement.toFixed(2)}m`, 20, 90);
    }

    drawScene2(t) {
        // --- CALCULATION ---
        const v = this.u + this.a * t;
        const speed = Math.abs(v);
        const velocity = v;
        const s = this.u * t + 0.5 * this.a * t * t;


        // --- DRAWING SETUP ---
        const carWidth = 40;
        const carHeight = 20;
        const roadY = this.ctx.canvas.height / 2 + 50;
        const startX = 60;
        const endX = this.ctx.canvas.width - 60;
        const roadLength = endX - startX;

        // Scale the movement
        const s_at_tMax = this.u * this.tMax + 0.5 * this.a * this.tMax * this.tMax;
        const maxDisplacement = Math.abs(s_at_tMax);
        const scale = maxDisplacement > 0 ? roadLength / (maxDisplacement * 1.2) : 1;
        const carX = startX + s * scale;

        // --- DRAW ROAD ---
        this.ctx.beginPath();
        this.ctx.moveTo(startX - 20, roadY);
        this.ctx.lineTo(endX + 20, roadY);
        this.ctx.strokeStyle = '#aaa';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // --- DRAW CAR ---
        this.ctx.fillStyle = '#28a745'; // Green car
        this.ctx.fillRect(carX - carWidth / 2, roadY - carHeight, carWidth, carHeight);
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(carX - carWidth / 4, roadY, 5, 0, 2 * Math.PI);
        this.ctx.arc(carX + carWidth / 4, roadY, 5, 0, 2 * Math.PI);
        this.ctx.fill();

        // --- DRAW VELOCITY VECTOR ---
        const vectorScale = 5;
        const vectorY = roadY - carHeight - 30;
        const vectorEndX = carX + velocity * vectorScale;

        this.ctx.beginPath();
        this.ctx.moveTo(carX, vectorY);
        this.ctx.lineTo(vectorEndX, vectorY);
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        // Arrowhead
        const headlen = 10;
        const angle = Math.atan2(0, vectorEndX - carX);
        this.ctx.beginPath();
        this.ctx.moveTo(vectorEndX, vectorY);
        this.ctx.lineTo(vectorEndX - headlen * Math.cos(angle - Math.PI / 6), vectorY - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(vectorEndX, vectorY);
        this.ctx.lineTo(vectorEndX - headlen * Math.cos(angle + Math.PI / 6), vectorY - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.fillStyle = 'red';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Velocity Vector', carX + (velocity * vectorScale) / 2, vectorY - 15);


        // --- DRAW SPEEDOMETER ---
        const speedometerX = this.ctx.canvas.width - 100;
        const speedometerY = 80;
        const speedometerRadius = 50;
        const maxSpeed = 50; // Arbitrary max for the dial
        const speedAngle = (speed / maxSpeed) * Math.PI * 1.5 - Math.PI * 1.25;

        this.ctx.beginPath();
        this.ctx.arc(speedometerX, speedometerY, speedometerRadius, -Math.PI * 1.25, Math.PI * 0.25);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 10;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(speedometerX, speedometerY);
        this.ctx.lineTo(speedometerX + speedometerRadius * Math.cos(speedAngle), speedometerY + speedometerRadius * Math.sin(speedAngle));
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.fillStyle = 'black';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Speed', speedometerX, speedometerY + speedometerRadius + 15);


        // --- DRAW TEXT ---
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Time: ${t.toFixed(2)}s`, 20, 30);
        this.ctx.fillText(`Speed (magnitude): ${speed.toFixed(2)}m/s`, 20, 60);
        this.ctx.fillText(`Velocity (magnitude & direction): ${velocity.toFixed(2)}m/s`, 20, 90);
    }
    drawScene3(t) {
        // --- CALCULATION ---
        const s = this.u * t + 0.5 * this.a * t * t;
        const v = this.u + this.a * t;

        // --- DRAWING SETUP ---
        const carWidth = 40;
        const carHeight = 20;
        const roadY = this.ctx.canvas.height - 80;
        const startX = 60;
        const endX = this.ctx.canvas.width - 60;
        const roadLength = endX - startX;

        const s_at_tMax = this.u * this.tMax + 0.5 * this.a * this.tMax * this.tMax;
        const maxDisplacement = Math.abs(s_at_tMax);
        const scale = maxDisplacement > 0 ? roadLength / (maxDisplacement * 1.2) : 1;
        const carX = startX + s * scale;

        // --- DRAW ROAD & MARKERS ---
        this.ctx.beginPath();
        this.ctx.moveTo(startX, roadY);
        this.ctx.lineTo(endX, roadY);
        this.ctx.strokeStyle = '#aaa';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Add distance markers
        this.ctx.fillStyle = '#555';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        for (let i = 0; i <= 10; i++) {
            const markerX = startX + (i / 10) * roadLength;
            this.ctx.beginPath();
            this.ctx.moveTo(markerX, roadY - 5);
            this.ctx.lineTo(markerX, roadY + 5);
            this.ctx.stroke();
            this.ctx.fillText(`${( (i / 10) * (maxDisplacement * 1.2) ).toFixed(1)}m`, markerX, roadY + 20);
        }


        // --- DRAW CAR ---
        this.ctx.fillStyle = '#6f42c1'; // Purple car
        this.ctx.fillRect(carX - carWidth / 2, roadY - carHeight, carWidth, carHeight);
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(carX - carWidth / 4, roadY, 5, 0, 2 * Math.PI);
        this.ctx.arc(carX + carWidth / 4, roadY, 5, 0, 2 * Math.PI);
        this.ctx.fill();

        // --- DRAW TEXT & EQUATIONS ---
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Time: ${t.toFixed(2)}s`, 20, 30);

        this.ctx.font = '16px "Courier New", monospace';
        const eq_s = `s = ut + ½at² = ${s.toFixed(2)}m`;
        const eq_v = `v = u + at   = ${v.toFixed(2)}m/s`;
        const v2 = this.u**2 + 2 * this.a * s;
        const eq_v2 = `v²= u² + 2as = ${v2.toFixed(2)}`;

        this.ctx.fillStyle = '#0056b3';
        this.ctx.fillText(eq_s, 20, 70);
        this.ctx.fillStyle = '#c82333';
        this.ctx.fillText(eq_v, 20, 100);
        this.ctx.fillStyle = '#1e7e34';
        this.ctx.fillText(eq_v2, 20, 130);
    }
    drawScene4(t) {
        if (!this.stGraph || !this.vtGraph) return;

        this.stGraph.clear();
        this.vtGraph.clear();

        const points = 100;
        const fullSData = [];
        const fullVData = [];

        // 1. Generate data for the *entire* simulation duration to find the bounds
        for (let i = 0; i <= points; i++) {
            const time = (i / points) * this.tMax;
            fullSData.push(this.u * time + 0.5 * this.a * time * time);
            fullVData.push(this.u + this.a * time);
        }

        // Add the turning point to the displacement data if it occurs within the timeframe
        if (this.a !== 0) {
            const turningTime = -this.u / this.a;
            if (turningTime > 0 && turningTime < this.tMax) {
                fullSData.push(this.u * turningTime + 0.5 * this.a * turningTime * turningTime);
            }
        }

        // 2. Find the true min and max for both datasets
        const sMin = Math.min(...fullSData);
        const sMax = Math.max(...fullSData);
        const vMin = Math.min(...fullVData);
        const vMax = Math.max(...fullVData);

        // 3. Generate the data to be plotted for the *current* time `t`
        const plotSData = [];
        const plotVData = [];
         for (let i = 0; i <= points; i++) {
            const time = (i / points) * t;
            if (time > t) break; // Don't plot past the current time
            plotSData.push({ x: time, y: this.u * time + 0.5 * this.a * time * time });
            plotVData.push({ x: time, y: this.u + this.a * time });
        }

        // 4. Draw the graphs with the correct bounds
        this.stGraph.draw(plotSData, this.tMax, sMin, sMax);
        this.vtGraph.draw(plotVData, this.tMax, vMin, vMax);
    }

    drawScene5(t) {
        const radius = 100; // Fixed radius for now
        const angularVelocity = 1; // rad/s
        const angle = angularVelocity * t;

        const centerX = this.ctx.canvas.width / 2;
        const centerY = this.ctx.canvas.height / 2;

        const objX = centerX + radius * Math.cos(angle);
        const objY = centerY + radius * Math.sin(angle);

        // Draw circular path
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw object
        this.ctx.beginPath();
        this.ctx.arc(objX, objY, 10, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'orange';
        this.ctx.fill();

        // Draw tangential velocity vector
        const vectorLength = 50;
        const tangentAngle = angle + Math.PI / 2;
        const vectorEndX = objX + vectorLength * Math.cos(tangentAngle);
        const vectorEndY = objY + vectorLength * Math.sin(tangentAngle);

        this.ctx.beginPath();
        this.ctx.moveTo(objX, objY);
        this.ctx.lineTo(vectorEndX, vectorEndY);
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw text
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Time: ${t.toFixed(2)}s`, 20, 30);
        this.ctx.fillText(`Speed: ${(angularVelocity * radius).toFixed(2)}m/s`, 20, 60);
    }
}

class Graph {
    constructor(ctx, xLabel, yLabel) {
        this.ctx = ctx;
        this.xLabel = xLabel;
        this.yLabel = yLabel;
        this.padding = 40;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    draw(data, xMax, yMin, yMax) {
        const { width, height } = this.ctx.canvas;
        if (width === 0 || height === 0 || !data) return;

        // Define the drawable area
        const top = this.padding;
        const left = this.padding;
        const right = width - this.padding;
        const bottom = height - this.padding;
        const graphWidth = right - left;
        const graphHeight = bottom - top;

        // Add a guard clause to ensure the drawable area is positive.
        if (graphWidth <= 0 || graphHeight <= 0) return;

        // Handle the case where the range is zero to prevent division by zero
        const xRange = xMax === 0 ? 1 : xMax;
        let yRange = yMax - yMin;
        if (yRange === 0) yRange = 1;

        // Function to map data coordinates to canvas coordinates
        const toCanvasX = (dataX) => left + (dataX / xRange) * graphWidth;
        const toCanvasY = (dataY) => bottom - ((dataY - yMin) / yRange) * graphHeight;

        // --- DRAW AXES & LABELS ---
        this.ctx.beginPath();
        this.ctx.moveTo(left, top);
        this.ctx.lineTo(left, bottom);
        this.ctx.lineTo(right, bottom);
        this.ctx.strokeStyle = '#333';
        this.ctx.stroke();

        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.xLabel, left + graphWidth / 2, bottom + this.padding - 5);
        this.ctx.save();
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.yLabel, -(top + graphHeight / 2), left - this.padding + 15);
        this.ctx.restore();

        // --- DRAW AXIS TICKS ---
        // Y-axis ticks
        const numYTicks = 5;
        for (let i = 0; i <= numYTicks; i++) {
            const value = yMin + (i / numYTicks) * yRange;
            const y = toCanvasY(value);
            this.ctx.beginPath();
            this.ctx.moveTo(left - 5, y);
            this.ctx.lineTo(left, y);
            this.ctx.stroke();
            this.ctx.textAlign = 'right';
            this.ctx.fillText(value.toFixed(1), left - 8, y + 4);
        }
        // X-axis ticks
        const numXTicks = 5;
        for (let i = 0; i <= numXTicks; i++) {
            const value = (i / numXTicks) * xRange;
            const x = toCanvasX(value);
            this.ctx.beginPath();
            this.ctx.moveTo(x, bottom);
            this.ctx.lineTo(x, bottom + 5);
            this.ctx.stroke();
            this.ctx.textAlign = 'center';
            this.ctx.fillText(value.toFixed(1), x, bottom + 15);
        }

        // --- DRAW DATA ---
        if (data.length < 2) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 2;

        this.ctx.moveTo(toCanvasX(data[0].x), toCanvasY(data[0].y));
        for (let i = 1; i < data.length; i++) {
            this.ctx.lineTo(toCanvasX(data[i].x), toCanvasY(data[i].y));
        }
        this.ctx.stroke();
    }
}


// --- LOGIC ---
let scene4ResizeObserver = null;

function switchTab(event) {
    activeScene = event.target.dataset.tab;

    // Disconnect any existing observer
    if (scene4ResizeObserver) {
        scene4ResizeObserver.disconnect();
        scene4ResizeObserver = null;
    }

    // Update tab buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update simulation views
    document.querySelectorAll('.simulation-view').forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active');
    });
    const targetView = document.getElementById(`${activeScene}-view`);
    targetView.style.display = 'block';
    targetView.classList.add('active');

    // Update content panels
    multiStyleContent.innerHTML = multiStyleData[activeScene] || '';
    labChallengesContent.innerHTML = labChallengesData[activeScene] || '';

    // Special handling for scene4 to deal with flexbox layout timing
    if (activeScene === 'scene4') {
        scene4ResizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                // We only care about the first time it becomes visible and ready
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    // Now we are SURE the container has a size.
                    setupSimulator(); // 1. Create the simulator object
                    resizeCanvas();   // 2. Resize canvas & trigger initial draw

                    scene4ResizeObserver.disconnect(); // 3. Stop observing
                    scene4ResizeObserver = null;
                }
            }
        });
        scene4ResizeObserver.observe(targetView);
    } else {
    // For all other scenes, the timing is not critical.
        setupSimulator();
    resizeCanvas();
    }
}

function setupSimulator() {
    if (simulator) {
        simulator.stop();
    }

    let ctx;
    switch (activeScene) {
        case 'scene1':
            ctx = scene1Ctx;
            simulator = new MotionSimulator(ctx, activeScene);
            break;
        case 'scene2':
            ctx = scene2Ctx;
            simulator = new MotionSimulator(ctx, activeScene);
            break;
        case 'scene3':
            ctx = scene3Ctx;
            simulator = new MotionSimulator(ctx, activeScene);
            break;
        case 'scene4':
            simulator = new MotionSimulator(null, activeScene);
            simulator.stGraph = new Graph(scene4StCtx, 'Time (s)', 'Displacement (m)');
            simulator.vtGraph = new Graph(scene4VtCtx, 'Time (s)', 'Velocity (m/s)');
            break;
        case 'scene5':
            ctx = scene5Ctx;
            simulator = new MotionSimulator(ctx, activeScene);
            break;
    }
}

function resizeCanvas() {
    const activeView = document.querySelector('.simulation-view.active');
    if (!activeView) return;
    const canvases = activeView.querySelectorAll('canvas');

    canvases.forEach(canvas => {
        const { clientWidth, clientHeight } = canvas;
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
            canvas.width = clientWidth;
            canvas.height = clientHeight;
        }
    });

    if (simulator) {
        simulator.draw();
    }
}

function syncInputs(source, target) {
    target.value = source.value;
}

// --- EVENT LISTENERS ---
tabButtons.forEach(btn => btn.addEventListener('click', switchTab));
startStopButton.addEventListener('click', () => {
    if (simulator.isRunning) {
        simulator.stop();
        startStopButton.textContent = 'START';
    } else {
        simulator.start();
        startStopButton.textContent = 'STOP';
    }
});
resetButton.addEventListener('click', () => {
    simulator.reset();
    startStopButton.textContent = 'START';
});

initialVelocitySlider.addEventListener('input', () => syncInputs(initialVelocitySlider, initialVelocityInput));
initialVelocityInput.addEventListener('input', () => syncInputs(initialVelocityInput, initialVelocitySlider));
accelerationSlider.addEventListener('input', () => syncInputs(accelerationSlider, accelerationInput));
accelerationInput.addEventListener('input', () => syncInputs(accelerationInput, accelerationSlider));
timeSlider.addEventListener('input', () => syncInputs(timeSlider, timeInput));
timeInput.addEventListener('input', () => syncInputs(timeInput, timeSlider));
window.addEventListener('resize', resizeCanvas);


// --- INITIALIZATION ---
setupSimulator();
