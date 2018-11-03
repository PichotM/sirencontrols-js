/// <reference path='F:/Program Files (x86)/FiveM.app/citizen/scripting/v8/index.d.ts' />
/// <reference path='F:/Program Files (x86)/FiveM.app/citizen/scripting/v8/natives_universal.d.ts' />

const DecorSilent = '_IS_SIREN_SILENT';
const DecorBlip = '_IS_SIREN_BLIP';
const controlSilent = 58;
const timeoutSilent = 15;
// const SIRENSOUND_HOTKEY = 21;
// const SIRENSOUND_PNAME = '_IS_SIREN_ALT_SOUND';
// const HELDDOWN_HASH = GetHashKey('HELDDOWN');

class SirenClass {
    Initialize() {
        DecorRegister(DecorBlip, 2);
        DecorRegister(DecorSilent, 2);
        // DecorRegister(SIRENSOUND_PNAME, 2);

        this.playerVehicle;
        this.altSiren = false;
        this.blipSiren = false;
        this.hotkeyTimeout = 0;
    }

    IsSirenMuted(vehicle) {
        return DecorGetBool(vehicle || this.playerVehicle, DecorSilent);
    }

    /* IsAltSirenMuted(vehicle) {
        return DecorGetBool(vehicle || this.playerVehicle, SIRENSOUND_PNAME);
    } */

    IsBlipSirenMuted(vehicle) {
        return DecorGetBool(vehicle || this.playerVehicle, DecorBlip);
    }

    checkForSilentSirens() {
        for (let index = 0; index < NetworkGetNumConnectedPlayers(); index++) {
            const playerVeh = GetVehiclePedIsUsing(GetPlayerPed(index));
            if (playerVeh && IsVehicleSirenOn(playerVeh)){
                DisableVehicleImpactExplosionActivation(playerVeh, this.IsSirenMuted(playerVeh));
                // if (this.IsAltSirenMuted(playerVeh)) StartVehicleHorn(playerVeh, 1000, HELDDOWN_HASH, false);
                if (this.IsBlipSirenMuted(playerVeh)) BlipSiren(playerVeh);
            }
        }
    }

    updateInterval() {
        const ped = GetPlayerPed(-1);
        this.playerVehicle = GetVehiclePedIsUsing(ped);

        this.checkForSilentSirens();
    }

    updateTick() {
        if (this.playerVehicle && IsVehicleSirenOn(this.playerVehicle)) {
            // if (IsControlJustReleased(1, SIRENSOUND_HOTKEY) && !this.IsSirenMuted()) DecorSetBool(this.playerVehicle, SIRENSOUND_PNAME, !this.IsAltSirenMuted());
    
            if (IsControlPressed(1, controlSilent)) {
                this.hotkeyTimeout++;
            } else if (this.hotkeyTimeout != 0) {
                if (this.hotkeyTimeout > 0 && this.hotkeyTimeout < timeoutSilent) {
                    let boolSilent = !this.IsSirenMuted();
                    DecorSetBool(this.playerVehicle, DecorSilent, boolSilent);
                    DisableVehicleImpactExplosionActivation(this.playerVehicle, boolSilent);
                }

                this.hotkeyTimeout = 0;
            }

            if (IsControlPressed(1, controlSilent)) {
                if (this.hotkeyWarmup < timeoutSilent) {
                    this.hotkeyWarmup++;
                    return;
                }

                DecorSetBool(this.playerVehicle, DecorBlip, true);
            } else if(this.hotkeyWarmup != 0) {
                DecorSetBool(this.playerVehicle, DecorBlip, false);
                this.hotkeyWarmup = 0;
            }
        }
    }
}

const sirenClient = new SirenClass();
setInterval(() => {
    sirenClient.updateInterval();
}, 1000);

setTick(() => {
    sirenClient.updateTick();
});

on('onClientResourceStart', (r) => {
    if (r == GetCurrentResourceName()) sirenClient.Initialize();
});