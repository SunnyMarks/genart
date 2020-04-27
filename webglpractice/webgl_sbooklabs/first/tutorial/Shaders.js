class ShaderUtil {
    //Get our shader code
    static domShaderSrc(elmID) {
        var elm = document.getElementById(elmID);
        if (!elm || elm.text == "") { console.log(elmID + " shader not found or no text."); return null; }

        return elm.text;
    }
    //compile our shaders
    //we do this twice, one for vertex, one for fragment
    static createShader(gl, src, type) {
        //the only option for type is gl.VERTEX_SHADER or gl.FRAGMENT_SHADER (built in through API?)
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        //Get Error data if shader failed compiling
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Error compiling shader : " + src, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
    //once we get our shaders compiled we need to create a program
    static createProgram(gl, vShader, fShader, doValidate) {
        //Link shaders together
        var prog = gl.createProgram();
        gl.attachShader(prog, vShader);
        gl.attachShader(prog, fShader);
        gl.linkProgram(prog);

        //Check if successful
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error("Error creating shader program.", gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog); return null;
        }

        //Only do this for additional debugging.
        //once code is good, we don't need this
        if (doValidate) {
            gl.validateProgram(prog);
            if (!gl.getProgramParameter(prog, gl.VALIDATE_STATUS)) {
                console.error("Error validating program", gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog); return null;
            }
        }

        //Can delete the shaders since the program has been made.
        gl.detachShader(prog, vShader); //TODO, detaching might cause issues on some browsers, Might only need to delete.
        gl.detachShader(prog, fShader);
        gl.deleteShader(fShader);
        gl.deleteShader(vShader);

        return prog;
        //once this is written, link in html file
    }

    //..................................................
    // Helper functions
    //..................................................

    //Pass in Script Tag IDs for our two shaders and create a program from it. 
    static domShaderProgram(gl, vectID, fragID, doValidate) {
        let vShaderTxt = ShaderUtil.domShaderSrc(vectID); if (!vShaderTxt) return null;
        let fShaderTxt = ShaderUtil.domShaderSrc(fragID); if (!fShaderTxt) return null;
        let vShader = ShaderUtil.createShader(gl, vShaderTxt, gl.VERTEX_SHADER); if (!vShader) return null;
        let fShader = ShaderUtil.createShader(gl, fShaderTxt, gl.FRAGMENT_SHADER); if (!fShader) return null;

        return ShaderUtil.createProgram(gl, vShader, fShader, true);
    }
}