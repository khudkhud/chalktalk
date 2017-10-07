function() {
   // DEVELOPED BY KARL AND PAT

   // TODO UPDATE DEPTH WHEN NODE IS ADDED
   this.label = 'BST';

   let sketchCtx = null;

   function BinarySearchTree(sketchCtx) {
      this.sketchCtx = sketchCtx;

      this.root = null;

      this.depth = 0;

      // TODO : FIX UNDO / REDO, WILL REPLACE LEGACY VERSION LATER
      this.history = HistoryQueue.create();
      // TODO : REPLACE WITH WORKING HISTORY LATER
      this.historyStack = [];


      // Keeps track of all operations for output
      this.operationStack = [];

      // LEGACY UNDO
      this.useOldHistory = true;

      this._mustInitializePositions = true;

      this.depthMonitor = {};

      BinarySearchTree.Node = function(value, center) {
         this.value = value;
         this.left = null;
         this.right = null;
         this.center = (center == undefined) ? undefined : [center[0], center[1], 0];
         // MANAGE COLORS
         this.colorManager = new ColorManager();
      };

      let bst = this;


      this._applyAll = function(func, node) {
         func(node);
         if (node.left !== null) {
            this._applyAll(func, node.left);
         }
         if (node.right !== null) {
            this._applyAll(func, node.right);
         }
      };

      this.applyAll = function(func, node) {
         node = (node === undefined) ? this.root : node;
         if (node == null) {
            return;
         }
         this._applyAll(func, node);
      };

      this.resetGraphicTemporaries = function() {
         this.applyAll(function(node) {
            // RESET COLORS
            node.colorManager.enableColor(false);
         });
      };

      BinarySearchTree.Node.prototype = {
         get children() {
            const _children = [];
            if (this.left != null) {
               _children.push(this.left);
            }
            if (this.right != null) {
               _children.push(this.right);
            }
            return _children;
         },

         toString : function() {
            return "(" + this.value + ")";
         },

         print : function() {
            if (this.left !== null) {
               this.left.print();
            }
            console.log(this.toString());
            if (this.right !== null) {
               this.right.print();
            }
         }
      };

      this.operationMemory = {
         active : false,
         operation : null
      };
   }



   BinarySearchTree.prototype = {
      doPendingOperation : function() {
         if (!this.operationMemory.active) {
            return;
         }
         const status = this.operationMemory.operation();
         if (status.done) {
            this.operationMemory.active = false;
            this.operationMemory.operation = null;
            // TODO : MAKE RE-INITIALIZATION CLEANER,
            // ADDITIONAL CASES TO CONSIDER FOR IN-PROGRESS OPERATIONS
            this._mustInitializePositions = true;
         }
      },
      hasPendingOperation : function() {
         return this.operationMemory.active;
      },

      doPendingDraws : function() {
         // TODO
      },

      mustInitializePositions : function() {
         return this._mustInitializePositions;
      },
      // TODO IMPROVE
      calcTraversalPauseTime : function() {
         const size = this.size();
         if (size == 0) {
            return 0.1;
         }
         const ret = max((4.2 / size), 0.13);
         return ret;
      },

      getSize: function(){
        return this._getSize(this.root);
      },

      _getSize : function(node) {
         if (node === null) {
            return 0;
         }
         return this._getSize(node.left) + 1 + this._getSize(node.right);
      },

      inOrder : function() {
         const self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() {
               const op = self._inOrder(self.root, self.calcTraversalPauseTime());

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;
         }
      },

      _inOrder : function*(node, pauseTime) {
         node.colorManager.enableColor(true).setColor("purple");
         for (let p = SketchAnimation.pause(pauseTime, this.sketchCtx); p();) { yield; }
         if (node === null){
            return;
         }
         if (node.left !== null) {
            yield *this._inOrder(node.left, pauseTime);
         }
         node.colorManager.enableColor(true).setColor("green");
         for (let p = SketchAnimation.pause(pauseTime, this.sketchCtx); p();) { yield; }
         if (node.right !== null) {
            yield *this._inOrder(node.right, pauseTime);
         }
      },

      preOrder : function() {
         const self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() {
               const op = self._preOrder(self.root, self.calcTraversalPauseTime());

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;
         }
      },

      _preOrder : function*(node, pauseTime) {
         node.colorManager.enableColor(true).setColor("purple");
         for (let p = SketchAnimation.pause(pauseTime, this.sketchCtx); p();) { yield; }

         if (node === null) {
            return;
         }

         node.colorManager.enableColor(true).setColor("green");
         for (let p = SketchAnimation.pause(pauseTime, this.sketchCtx); p();) { yield; }

         if (node.left !== null) {
            yield *this._preOrder(node.left, pauseTime);
         }

         if (node.right !== null){
            yield *this._preOrder(node.right, pauseTime);
         }
      },


      postOrder : function() {
         const self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() {
               const op = self._postOrder(self.root, self.calcTraversalPauseTime());

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;
         }
      },

      _postOrder: function*(node, pauseTime) {
         node.colorManager.enableColor(true).setColor("purple");
         for (let p = SketchAnimation.pause(pauseTime, this.sketchCtx); p();) { yield; }
         if (node === null) {
            return;
         }

         if (node.left !== null) {
            yield *this._postOrder(node.left, pauseTime);
         }

         if (node.right !== null) {
            yield *this._postOrder(node.right, pauseTime);
         }

         node.colorManager.enableColor(true).setColor("green");
         for (let p = SketchAnimation.pause(pauseTime, this.sketchCtx); p();) { yield; }

      },

      breadthFirst : function() {
         const self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() {
               const op = self._breadthFirst(self.calcTraversalPauseTime());

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;
         }
      },

      _breadthFirst : function*(pauseTime) {
         if (this.root === null) {
            return;
         }

         const pauseDequeue = SketchAnimation.pauseAutoReset(pauseTime, this.sketchCtx);
         const pauseEnqueue = SketchAnimation.pauseAutoReset(pauseTime, this.sketchCtx);

         const queue = [];
         let parent = this.root;

         parent.colorManager.enableColor(true).setColor("yellow");
         queue.push(parent);
         while (pauseEnqueue()) { yield; }
         
         while (queue.length > 0) {
            parent = queue.shift();
            parent.colorManager.enableColor(true).setColor("green");
            while (pauseDequeue()) { yield; }

            for (const child of parent.children) {
               child.colorManager.enableColor(true).setColor("yellow");
               queue.push(child);
               while (pauseEnqueue()) { yield; }
            }
         }
      },

      remove : function(value) {
         this.operationStack.push("remove("+value+")");
         const self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() {
               const op = self._remove(value, self.root, null);

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;
         }
      },

      _remove : function*(value, root, parent=null) {
         if (root == null) {
            return;
         }
         let current = root;
         let comp = null;

         while (current !== null) {
            comp = current.value;
            if (value == comp) {
               current.colorManager.enableColor(true).setColor("orange");
               this.applyAll(function(node) {
                  node.colorManager.enableColor(true).setColor("grey");
               }, current.right);
               break;
            }
            current.colorManager.enableColor(true).setColor("purple");
            parent = current;
            if (value < comp) {
               // HIGHLIGHT UN-TRAVERSED SUB-TREE
               this.applyAll(function(node) {
                  node.colorManager.enableColor(true).setColor("grey");
               }, current.right);

               current = current.left;
            }
            else {
               // HIGHLIGHT UN-TRAVERSED SUB-TREE
               this.applyAll(function(node) {
                  node.colorManager.enableColor(true).setColor("grey");
               }, current.left);

               current = current.right;
            }

            for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; } // POTENTIAL EFFICIENCY ISSUES?
         }

         // NODE TO REMOVE DOES NOT EXIST,ABORT
         // (NO WAY TO SPECIFY NON-EXISTING NODE YET : TODO)
         if (value != comp) {
            return;
         }

         // CASES 1 AND 2: 1 CHILD,
         if (parent == null) {
            // SENTINEL
            parent = new BinarySearchTree.Node(-1);
         }
         if (parent.left == current) {
            if (current.left === null) {
               ///////// VERBOSE WAY
               {
                  let pause = SketchAnimation.create(
                     SketchAnimation.Type.NONE(),
                     .6,
                     true
                  );
                  while (!pause.step(this.sketchCtx.elapsed).done) {
                     yield;
                  }
               }
               /////////
               current.colorManager.setColor("orange");

               parent.left = current.right;
               return;
            }
            else if (current.right === null) {
               ///////// SHORTENED WAY
               for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
               /////////
               current.colorManager.setColor("orange");
               parent.left = current.left;
               return;
            }
         }
         else if (parent.right == current) {
            if (current.left === null) {
               /////////
               for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
               /////////
               current.colorManager.setColor("orange");
               parent.right = current.right;
               return;
            }
            else if (current.right === null) {
               /////////
               for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
               /////////
               current.colorManager.setColor("orange");
               parent.right = current.left;
               return;
            }
         }
         else if (current.left == null && current.right == null) {
            /////////
            for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
            /////////
            current.colorManager.setColor("orange");
            this.root = null;
            return;
         }

         // CASE 3 : FIND A PREDECESSOR

         // NAVIGATE BRANCH TO FIND PREDECESSOR
         let find = current.left;
         let copyVal = 0;

         ////////
         for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
         /////////

         find.colorManager.enableColor(true).setColor("cyan");

         /////////
         for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
         /////////

         this.applyAll(function(node) {
            node.colorManager.enableColor(true).setColor("grey");
         }, find.left);

         while (find.right !== null) {
            find = find.right;
            find.colorManager.enableColor(true).setColor("cyan");
            this.applyAll(function(node) {
               node.colorManager.enableColor(true).setColor("grey");
            }, find.left);

            if (find.right == null) {
               break;
            }
            /////////
            for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
            /////////
         }

         find.colorManager.enableColor(true).setColor("orange");

         /////////
         for (let p = SketchAnimation.pause(.3, this.sketchCtx); p();) { yield; }
         /////////

         // MOVE THE COPY VALUE (VISUALLY)
         {
            let c1 = find.center;
            let c2 = current.center;
            let valMoveAni = SketchAnimation.create(
               SketchAnimation.Type.LINE({
                  start : { x : c1[0], y : c1[1] },
                  end : { x : c2[0], y : c2[1] }
               }),
               .6,
               true
            );
            let ret = {};
            while (!ret.done) {
               ret = valMoveAni.step(this.sketchCtx.elapsed);
               textHeight(this.sketchCtx.mScale(.4));
               mText(find.value, ret.point, .5, .5, .5);
               yield;
            }
         }

         current.value = find.value;

         /////////
         for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
         /////////

         current.colorManager.enableColor(true).setColor("purple");

         /////////
         for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
         /////////

         yield *this._remove(current.value, current.left, current);
      },

      insert : function(value) {
         this.operationStack.push("insert("+value+")");
         // THIS WILL BE A COMMON PATTERN THAT I'LL TRY TO ABSTRACT AWAY LATER
         const self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() {
               const op = self._insert(value);

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;

            // function depthHasIncreased() {
            //    if (self.root === null) {
            //       self.depth = 1;
            //       self.depthMonitor[0] = 1;
            //       return true;
            //    }

            //    let current = self.root;
            //    let comp = null;

            //    let _depth = 1;
            //    while (current !== null) {
            //       _depth++;
            //       if (value == comp) {
            //          return; 
            //       }
            //       else if (value < comp) {
            //          current = current.left;
            //       }
            //       else {
            //          current = current.right;
            //       }
            //    }
            //    self.depthMonitor[_depth] = (self.depthMonitor[_depth] !== undefined) ? self.depthMonitor[_depth] + 1 : _depth;
            //    if (self.depth < _depth) {
            //       self.depth = _depth;
            //       return true;
            //    }
            //    return false;               
            // }  

            // if (depthHasIncreased()) {
            //    this._mustInitializePositions = true;
            // }
         }
      },
      _insert : function*(value) {
         const toInsert = new BinarySearchTree.Node(value);
         toInsert.colorManager.enableColor(true).setColor("green");
         if (this.root === null) {
            this.root = toInsert;
            this.depth = 1;
            this.depthMonitor[0] = 1;
            this._mustInitializePositions = true;
            return;
         }

         let parent = null;
         let current = this.root;
         let comp = null;

         let _depth = 1;

         while (current !== null) {
            _depth++;
            current.colorManager.enableColor(true).setColor("purple");
            parent = current;
            comp = current.value;
            if (value == comp) {
               return;
            }
            else if (value < comp) {
               // HIGHLIGHT UN-TRAVERSED SUB-TREE
               this.applyAll(function(node) {
                  node.colorManager.enableColor(true).setColor("grey");
               }, current.right);

               current = current.left;
            }
            else {
               // HIGHLIGHT UN-TRAVERSED SUB-TREE
               this.applyAll(function(node) {
                  node.colorManager.enableColor(true).setColor("grey");
               }, current.left);

               current = current.right;
            }

            for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }

         }

         if (value < comp) {
            parent.left = toInsert;
         }
         else {
            parent.right = toInsert;
         }

         this.depthMonitor[_depth] = (this.depthMonitor[_depth] !== undefined) ? this.depthMonitor[_depth] + 1 : _depth;
         if (this.depth < _depth) {
            this.depth = _depth;
            //this._mustInitializePositions = true;
         }
         else {
            return;
         }

         // TODO : EXTRACT INTO SEPARATE FUNCTION (STRETCHING TREE DEPENDING ON DEPTHS)

         function*stretchPositions(root, totalTime) {
            // CREATE AN ARRAY OF THE ORIGINAL NODE POSITIONS
            function getOriginalPositions(root, arr, nodeArr) {
               if (root == null || root.center == undefined) {
                  return;
               }
               arr.push(root.center);
               nodeArr.push(root);
               
               getOriginalPositions(root.left, arr, nodeArr);
               getOriginalPositions(root.right, arr, nodeArr);
            }
            // TRAVERSE THE TREE AND CALCULATE THE NEW NODE POSITIONS
            // WITHOUT MUTATING THE TREE,
            // RETURN AN ARRAY OF THESE NEW POSITIONS
            // (SAME ORDER AS IN getOriginalPositions())
            function getNewPositions(root, arr) {
               sketchCtx._predictTreeLayout(root, arr);
            }

            const starts = [];
            const nodes = [];
            const ends = [];
            
            // GET CURRENT NODE POSITIONS AND POINTERS TO NODES
            getOriginalPositions(root, starts, nodes);
            // CALCULATE NEW NODE POSITIONS FOR STRETCHED TREE
            getNewPositions(root, ends);

            // CREATE LINEAR INTERPOLATION OBJECTS FOR EACH NODE'S
            // MOVEMENT TOWARDS THEIR NEW POSITIONS
            const transitions = [];
            for (let t = 0; t < starts.length; t++) {
               transitions.push(
                  SketchAnimation.create(
                     SketchAnimation.Type.LINE({
                        start : {x : starts[t][0], y : starts[t][1]},
                        end : {x : ends[t][0], y : ends[t][1]}
                     }),
                     totalTime,
                     true
                  )
               );
            }

            // MOVE THE NODES UNTIL THEY REACH THEIR END POSITIONS
            let done = null;
            let status = null;
            do {
               done = true;
               for (let t = 0; t < transitions.length; t++) {
                  status = transitions[t].step(sketchCtx.elapsed);
                  nodes[t].center = status.point;
                  done &= status.done;
               }  
               yield;             
            } while (!done);
         }

         // STRETCH THE TREE OUTWARDS
         const stretch = stretchPositions(this.root, 0.6);
         while (!stretch.next().done) {
            yield;
         }
      },

      size : function(node) {
         if (node === undefined) {
            node = this.root;
         }
         return this._size(this.root);
      },

      _size : function(node) {
         if (node === null) {
            return 0;
         }
         return this._size(node.left) + 1 + this._size(node.right);
      },

      copyData : function(oldNode) {
         const newNode = new BinarySearchTree.Node(oldNode.value, oldNode.center);

         if (oldNode.left !== null){
            newNode.left = this.copyData(oldNode.left)
         }
         if (oldNode.right !== null){
            newNode.right = this.copyData(oldNode.right);
         }
         return newNode;
      },
      clone : function() {
         const newBST = new BinarySearchTree(this.sketchCtx);
         const oldNode = this.root;
         if (this.root === null) {
            return newBST;
         }

         newBST.root = new BinarySearchTree.Node(oldNode.value, oldNode.center);
         newBST.depth = this.depth;
         if (oldNode.left !== null) {
            newBST.root.left = this.copyData(oldNode.left);
         }
         if (oldNode.right !== null) {
            newBST.root.right = this.copyData(oldNode.right);
         }

         return newBST;

      },

      setState : function(now, past) {
         now.root = past.root;
         now.depth = past.depth;
      },

      saveState : function() {
         if (this.useOldHistory) {
            this.historyStack.push(this.clone());
            const newBST = this.historyStack[this.historyStack.length - 1];
            this.root = newBST.root;
            return;
         }

         // TODO
         // this.history.saveState(this.clone(), this.setState);
      },

      restorePast : function() {
         if (this.useOldHistory) {
            if (this.historyStack.length <= 1) {
               return;
            }
            const temp = this.historyStack.pop();
            const oldBST = this.historyStack[this.historyStack.length - 1];

            this.root = oldBST.root;
            this.depth = oldBST.depth;
         }

         // TODO
         // this.history.restorePast(this, this.setState);
      },

      restoreFuture : function() {
         // TODO
         // this.history.restoreFuture(this, this.setState);
      },

      _sortedArrayToBST : function(arr, start, end) {
         if (start > end){
            return null;
         }
         const mid = Math.trunc((start + end) / 2);
         const node = new BinarySearchTree.Node(arr[mid]);
         this.operationStack.push("insert(" + arr[mid] + ")");
         node.left = this._sortedArrayToBST(arr, start, mid - 1);
         node.right = this._sortedArrayToBST(arr, mid + 1, end);
         return node;
      },

      createArrWithDepth : function(depth) {
         const height = depth - 1;
         const maxVal = pow(2, height + 1) - 1;
         const arr = [];
         for (let i = 1; i <= maxVal; i++){
            arr.push(i);
         }
         return arr;
      },

      createBSTWithDepth : function(value){
        this.depth = value;
        const arr = this.createArrWithDepth(value);

        return this._sortedArrayToBST(arr, 0, arr.length-1);;
      },

      print : function() {
         if (this.root === null) {
            return;
         }
         this.root.print();
      },
   };


   this.setup = function() {
      sketchCtx = this;
      sketchCtx.elapsed = 0.0;
      this.tree = new BinarySearchTree(sketchCtx);
      this.tree.root = this.tree.createBSTWithDepth(3);
      this.tree.saveState();

      this.traversalTypeIdx = 0;
      this.traversals = [
         ["pre-order", function() { sketchCtx.tree.preOrder(); }],
         ["in-order", function() { sketchCtx.tree.inOrder(); }],
         ["post-order", function() { sketchCtx.tree.postOrder(); }],
         ["breadth first", function() { sketchCtx.tree.breadthFirst(); }]
      ];

      this.onSwipe[0] = [
         this.traversals[this.traversalTypeIdx][0],
         function() {
            this.traversals[this.traversalTypeIdx][1]();
         }
      ];
   };

   // TODO, WILL SET NODE CENTERS ONLY WHEN DEPTH CHANGES
   // UNUSED
   this._predictTreeLayout = function(node, arr, center = [0, 0], radius = 0.5, xOffset = 5, yOffset = 2, zOffset = 0) {
      if (node === null) {
         return;
      }

      function traverseTree(node, arr, center, radius, parentCenter, parentRadius, xOffset = 5, yOffset = 2, zOffset = 0) {
         // TODO, GIVE THE NEWLY INSERTED OR REMOVED NODE 
         // A DEFAULT CENTER FOR THE TREE STRETCHING ANIMATION
         if (node.center === undefined) {
            return;
         }
         arr.push(center);

         if (node.left !== null) {
            const newCenter = [center[0] - xOffset * radius,center[1] - yOffset * radius];
            traverseTree(node.left, arr, newCenter, radius, center, radius, xOffset / 2);
         }
         if (node.right !== null) {
            const newCenter = [center[0] + xOffset * radius,center[1] - yOffset * radius];
            traverseTree(node.right, arr, newCenter, radius, center, radius, xOffset / 2);
         }
      }

      const nodeSize = radius;
      const curNode = node;
      const depth = this.tree.depth;

      if (depth > 4){
         traverseTree(curNode, arr, center, nodeSize, undefined, undefined, 20);
      }
      else if (depth > 3){
         traverseTree(curNode, arr, center, nodeSize, undefined, undefined, 10);
      }
      else if (depth > 0) {
         traverseTree(curNode, arr, center, nodeSize);
      }
   }

   this.drawNode = function(node, center, radius, parentCenter, parentRadius) {
     const left = center[0] - radius;
     const right = center[0] + radius;
     const bottom = center[1] - radius;
     const top = center[1] + radius;

     node.colorManager.activateColor();
     // DRAW CONTAINER
     mDrawOval([left, bottom], [right, top], 32, PI / 2 - TAU);
     node.colorManager.deactivateColor();

     // DRAW ELEMENT
     textHeight(this.mScale(.4));
     mText(node.value, center, .5, .5, .5);
   };

   // TODO : MOVE DRAW FUNCTIONS INTO THE STRUCTURE ITSELF?
   this._drawTree = function(node, center, radius, xOffset = 5, yOffset = 2) {
      if (node === null) {
         return;
      }

      function drawParentToChildEdge(center, radius, childCenter) {
         if (childCenter == undefined) {
            return;
         }
         const childParentVec = [childCenter[0] - center[0], childCenter[1] - center[1]];
         const childParentDist = sqrt(pow(childParentVec[0], 2) + pow(childParentVec[1], 2));

         const edgeOfParent = [center[0] + radius / childParentDist * childParentVec[0], center[1] + radius / childParentDist * childParentVec[1]];
         const edgeOfChild = [childCenter[0] - radius / childParentDist * childParentVec[0], childCenter[1] - radius / childParentDist * childParentVec[1]];
         mLine(edgeOfParent, edgeOfChild);
      }

      if (this.tree.mustInitializePositions()) {
         node.center = center;
      }

      // TODO : DON'T ADD NEW NODE UNTIL REST OF TREE HAS MOVED TO CORRECT POSITIONS, THIS IS A TEMPORARY FIX
      if (node.center == undefined) {
         return;
      }

      center = node.center;

      this.drawNode(node, center, radius);

      if (node.left !== null) {
         const newCenter = (this.tree.mustInitializePositions()) ?
                        [center[0] - xOffset * radius, center[1] - yOffset * radius] :
                        node.left.center;

         this._drawTree(node.left, newCenter, radius, xOffset / 2);
         drawParentToChildEdge(center, radius, newCenter);
      }
      if (node.right !== null) {
         const newCenter = (this.tree.mustInitializePositions()) ?
                        [center[0] + xOffset * radius, center[1] - yOffset * radius] :
                        node.right.center;

         this._drawTree(node.right, newCenter, radius, xOffset / 2);
         drawParentToChildEdge(center, radius, newCenter);
      }
   };

   this.drawTree = function(node, center, radius, xOffset = 5, yOffset = 2) {
      this._drawTree(node, center, radius, xOffset, yOffset);
      this.tree._mustInitializePositions = false;
   };

   // CHECK IF POINT LIES WITHIN CIRCLE
   this.inCircle = function(node, clickLocation){
      const dist = Math.sqrt((clickLocation[0] - node.center[0]) * (clickLocation[0] - node.center[0]) +
                          (clickLocation[1] - node.center[1]) * (clickLocation[1] - node.center[1]));
      return dist < 0.5;
   };

   this._findClickedNode = function(node, clickLocation) {
      if (!this.inCircle(node, clickLocation)) {
         if (node.center[0] > clickLocation[0]) {
            if (node.left !== null){
               return this.findClickedNode(node.left, clickLocation);
            }
            return null;
         }
         else {
            if (node.right !== null) {
               return this.findClickedNode(node.right, clickLocation);
            }
            return null;
         }
      }
      return node;
   };

   this.findClickedNode = function(node, clickLocation) {
      return (node === null) ?
               null : this._findClickedNode(node, clickLocation);
   };

   // STORE CLICK INFORMATION FROM PREVIOUS FRAMES
   this.clickInfoCache = {
      px : null,
      py : null,
      time : -1
   };


   this.onPress = function(p) {
      const ci = this.clickInfoCache;
      ci.x = p.x;
      ci.y = p.y;
      ci.time = time;


      this.tree.resetGraphicTemporaries();
   }

   this.onRelease = function(p) {
      const ci = this.clickInfoCache;
      if (abs(p.x - ci.x) < 0.05 &&
          abs(p.y - ci.y) < 0.05) {
         const node = this.findClickedNode(this.tree.root, [ci.x, ci.y]);
         if (node !== null) {
            this.tree.saveState();
            this.tree.remove(node.value);
         }
      }
      ci.x = null;
      ci.y = null;
   }

   this.onSwipe[4] = [
      'undo',
      function() {
         this.tree.restorePast();
      }
   ];

   // this.onSwipe[0] = [
   //    'redo',
   //    function() {
   //       this.tree.restoreFuture();
   //    }
   // ];


   this.onCmdClick = function(p) {
      this.traversalTypeIdx = (this.traversalTypeIdx + 1) % this.traversals.length;
      this.onSwipe[0][0] = this.traversals[this.traversalTypeIdx][0];
   };
   this.onCmdPress = function(p) {
      console.log("cmd_press");
   };
   this.onCmdDrag = function(p) {
      console.log("cmd_drag");
   };
   this.onCmdRelease = function(p) {
      console.log("cmd_release");
   };

   this.onDrag = function(p) {
      const ci = this.clickInfoCache;
      // save a point "boundary"/"threshold" for comparison
      const point = [p.x, p.y];

      const addedDepth = Math.round((ci.y - point[1]) / 2);
      if (addedDepth !== 0) {
         let newDepth = this.tree.depth + addedDepth;
         newDepth = min(newDepth, 6);
         newDepth = max(newDepth, 0);
         this.tree.root = this.tree.createBSTWithDepth(newDepth);
         this.tree._mustInitializePositions = true;
         if (!(this.tree.depth === 0 && newDepth === 0)) {
            this.tree.saveState();
         }
         this.tree.depth = newDepth;

         ci.y = point[1];
      };
   };

   this.output = function() {
      return this.tree.operationStack;
   }

   this.under = function(other) {
      if (other.output === undefined) {
         return;
      }

      let out = other.output();
      out = Number(1 * out);

      this.tree.saveState();
      this.tree.insert(out);

      other.fade();
      other.delete();
   };

   this.drawEmpty = function(center, radius) {
      const left = center[0] - radius;
      const right = center[0] + radius;
      const bottom = center[1] - radius;
      const top = center[1] + radius;
      color("grey");
      mDrawOval([left, bottom], [right, top], 32, PI / 2 - TAU);

      color("blue");
      textHeight(this.mScale(.2));
      mText("nullptr", center, .5, .5, .5);
   };


   // THE ELAPSED TIME MUST BE AVAILABLE AT ALL TIMES, HOW TO ENFORCE?
   this.render = function(elapsed) {
      this.elapsed = elapsed;

      this.duringSketch(function(){
         mDrawOval([-1,-1], [1,1], 32, PI, 0);
      });
      this.afterSketch(function() {
         let nodeSize = 0.5;
         let center = [0, 0];

         let curNode = this.tree.root;
         let depth = this.tree.depth;

         this.tree.doPendingOperation();

         if (depth > 4) {
            this.drawTree(curNode, center, nodeSize, 20);
         }
         else if (depth > 3) {
            this.drawTree(curNode, center, nodeSize, 10);
         }
         else if (depth > 0) {
            this.drawTree(curNode, center, nodeSize);
         }
         else {
            this.drawEmpty(center, nodeSize);
         }
      });
   }
}
